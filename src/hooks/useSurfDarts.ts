import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Circle, ThrowData, RoundData } from '../types';
import { saveGameData } from '../services/apiService';

const MAX_ROUNDS = 5;
const INITIAL_BOARD_RADIUS = 250;

export const useSurfDarts = (sessionId: string | null) => {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalScore: 0,
    circles: [{ id: 0, x: 0, y: 0, radius: INITIAL_BOARD_RADIUS }],
    isGameOver: false,
    message: null,
  });

  // Always keep a ref of the latest state to avoid stale reads in handlers
  const stateRef = useRef(gameState);
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const messageTimerRef = useRef<number | null>(null);

  // Euclidean distance helper
  const dist = (x1: number, y1: number, x2: number, y2: number) =>
    Math.hypot(x1 - x2, y1 - y2);

  // Safe reciprocal to avoid division-by-zero if click is exactly at a center
  const recip = (d: number) => 1 / Math.max(d, 1e-6);

  // Centralized message setter (prevents extra state races)
  const setTransientMessage = useCallback((text: string | null) => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setGameState(prev => ({ ...prev, message: text }));
    if (text) {
      messageTimerRef.current = window.setTimeout(() => {
        setGameState(prev => ({ ...prev, message: null }));
        messageTimerRef.current = null;
      }, 3500);
    }
  }, []);

  // Main throw handler (single functional update to avoid stale state bugs)
  const handleThrow = useCallback((throwData: ThrowData) => {
    const prev = stateRef.current;
    if (prev.isGameOver) return;

    const { x, y } = throwData;
    const circles = prev.circles;
    const focalIndex = circles.length - 1;
    const focal = circles[focalIndex];

    const distanceToFocal = dist(x, y, focal.x, focal.y);
    const hitFocal = distanceToFocal <= focal.radius;

    // Compute round score per the corrected indicator rule only if focal is hit
    let roundScore = 0;
    if (hitFocal) {
      // For round n, we have n terms in the scoring formula
      // Each term checks specific circles and adds reciprocal of distance to a specific center
      
      for (let termIndex = 0; termIndex <= focalIndex; termIndex++) {
        // For term i (0-indexed), we need to check if throw is inside:
        // - The focal circle (always required since hitFocal is true)
        // - All circles from focal down to circle at index (focalIndex - termIndex)
        
        let insideRequiredCircles = true;
        
        // Check if throw is inside all circles from focal down to target for this term
        for (let checkIdx = focalIndex; checkIdx >= focalIndex - termIndex; checkIdx--) {
          if (checkIdx < 0) break;
          const circle = circles[checkIdx];
          const distToCircle = dist(x, y, circle.x, circle.y);
          if (distToCircle > circle.radius) {
            insideRequiredCircles = false;
            break;
          }
        }
        
        if (insideRequiredCircles) {
          // Calculate distance from throw to the center of the target circle for this term
          const targetIdx = focalIndex - termIndex;
          if (targetIdx >= 0) {
            const targetCircle = circles[targetIdx];
            const distToTarget = dist(x, y, targetCircle.x, targetCircle.y);
            roundScore += recip(distToTarget);
          }
        }
      }
    }

    // Decide next state *once*, then optionally persist
    let nextState: GameState;
    let roundDataToSave: RoundData | null = null;

    if (!hitFocal) {
      // Strict miss rule: do not adjust score or circles; end immediately
      nextState = {
        ...prev,
        isGameOver: true,
        message: 'You missed the target!',
      };
      console.debug('[SurfDarts] MISS focal', {
        round: prev.currentRound,
        x,
        y,
        focalIndex,
        distanceToFocal,
      });
    } else {
      const newCircle: Circle = {
        id: circles.length, // unique, append-only
        x,
        y,
        radius: distanceToFocal,
      };
      const nextCircles = [...circles, newCircle];
      const nextTotal = prev.totalScore + roundScore;
      const nextRound = prev.currentRound + 1;

      const isFinal = nextRound > MAX_ROUNDS;

      nextState = {
        ...prev,
        circles: nextCircles,
        totalScore: nextTotal,
        currentRound: isFinal ? prev.currentRound : nextRound,
        isGameOver: isFinal,
        message: isFinal ? 'Game Complete!' : `Round ${nextRound}: Aim for the new circle!`,
      };

      roundDataToSave = {
        roundNumber: prev.currentRound,
        score: roundScore,
        throwX: x,
        throwY: y,
        circles: nextCircles,
      };

      console.debug('[SurfDarts] HIT focal', {
        round: prev.currentRound,
        x,
        y,
        focalIndex,
        distanceToFocal,
        roundScore,
        nextRound,
        isFinal,
      });
    }

    // Apply computed state once
    setGameState(nextState);

    // Persist after state set (fire-and-forget)
    if (sessionId && roundDataToSave) {
      try {
        saveGameData(`round_${roundDataToSave.roundNumber}`, roundDataToSave);
      } catch {
        // ignore persistence errors for gameplay
      }
    }
  }, [sessionId]);

  const resetGame = useCallback(() => {
    const prev = stateRef.current;
    if (sessionId) {
      try {
        saveGameData('game_end', {
          finalScore: prev.totalScore,
          totalRounds: prev.currentRound - 1,
        });
      } catch {
        // ignore
      }
    }
    setGameState({
      currentRound: 1,
      totalScore: 0,
      circles: [{ id: 0, x: 0, y: 0, radius: INITIAL_BOARD_RADIUS }],
      isGameOver: false,
      message: null,
    });
  }, [sessionId]);

  // On terminal game over, persist once more (idempotent safety)
  useEffect(() => {
    if (gameState.isGameOver && sessionId) {
      try {
        saveGameData('game_end', {
          finalScore: gameState.totalScore,
          totalRounds: gameState.currentRound - 1,
        });
      } catch {
        // ignore
      }
    }
  }, [gameState.isGameOver, gameState.totalScore, gameState.currentRound, sessionId]);

  // Optional: show a message on first mount / when round changes
  useEffect(() => {
    if (gameState.isGameOver) return;
    if (gameState.currentRound === 1) {
      setTransientMessage('Round 1: Throw your dart anywhere on the board!');
    } else {
      setTransientMessage(`Round ${gameState.currentRound}: Aim for the new circle!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentRound, gameState.isGameOver]);

  return { gameState, handleThrow, resetGame };
};