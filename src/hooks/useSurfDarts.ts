import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Circle, ThrowData, RoundData } from '../types';
import { saveGameData } from '../services/apiService';

const MAX_ROUNDS = 5;
const INITIAL_BOARD_RADIUS = 250;

// This custom hook encapsulates all the game logic for Surf Darts.
export const useSurfDarts = (sessionId: string | null) => {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalScore: 0,
    circles: [{ id: 0, x: 0, y: 0, radius: INITIAL_BOARD_RADIUS }], // The main dartboard
    isGameOver: false,
    message: null,
  });

  const messageTimerRef = useRef<number | null>(null);

  // Effect to show messages when round changes or game ends
  useEffect(() => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    let newMessage: string | null = null;
    if (gameState.isGameOver) {
      newMessage = gameState.totalScore > 0 ? 'Game Complete!' : 'You missed the target!';
    } else {
      newMessage = `Round ${gameState.currentRound}: Aim for the new circle!`;
      if (gameState.currentRound === 1) {
        newMessage = `Round 1: Throw your dart anywhere on the board!`;
      }
    }

    setGameState(prev => ({ ...prev, message: newMessage }));

    messageTimerRef.current = setTimeout(() => {
      setGameState(prev => ({ ...prev, message: null }));
    }, 3500); // Message disappears after 3.5 seconds

    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, [gameState.currentRound, gameState.isGameOver]);


  // This function is called by the Kaplay component when the user "throws" a dart.
  const handleThrow = useCallback((throwData: ThrowData) => {
    if (gameState.isGameOver) return;

    setGameState(prev => ({ ...prev, message: null })); // Clear any existing message immediately on throw
    if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
    }

    const { x, y } = throwData;
    let currentScore = gameState.totalScore;
    let nextCircles = [...gameState.circles];
    let roundScore = 0;

    const targetCircle = gameState.circles[gameState.circles.length - 1];
    const distanceToTargetCenter = Math.sqrt(Math.pow(x - targetCircle.x, 2) + Math.pow(y - targetCircle.y, 2));

    if (distanceToTargetCenter > targetCircle.radius) {
      setGameState(prev => ({ ...prev, isGameOver: true }));
      return;
    }

    let newCircleCenter = { x, y };
    let newCircleRadius = 0;

    for (let i = 0; i < gameState.circles.length; i++) {
        const circle = gameState.circles[i];
        const dist = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
        if (dist <= circle.radius) {
            const prevCircle = gameState.circles[i-1] || {x:0, y:0};
            const radiusFromThrow = Math.sqrt(Math.pow(x - prevCircle.x, 2) + Math.pow(y - prevCircle.y, 2));
            roundScore += radiusFromThrow;
        }
    }
    
    newCircleRadius = distanceToTargetCenter;
    currentScore += roundScore;

    const newCircle: Circle = {
      id: gameState.circles.length,
      x: newCircleCenter.x,
      y: newCircleCenter.y,
      radius: newCircleRadius,
    };
    nextCircles.push(newCircle);

    const roundDataToSave: RoundData = {
        roundNumber: gameState.currentRound,
        score: roundScore,
        throwX: x,
        throwY: y,
        circles: nextCircles,
    };
    if (sessionId) {
        saveGameData(`round_${gameState.currentRound}`, roundDataToSave);
    }

    const nextRound = gameState.currentRound + 1;
    if (nextRound > MAX_ROUNDS) {
      setGameState(prev => ({
        ...prev,
        totalScore: currentScore,
        circles: nextCircles,
        isGameOver: true,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentRound: nextRound,
        totalScore: currentScore,
        circles: nextCircles,
        isGameOver: false,
      }));
    }
  }, [gameState, sessionId]);

  // Function to reset the game to its initial state.
  const resetGame = useCallback(() => {
    if (sessionId) {
        saveGameData('game_end', {
            finalScore: gameState.totalScore,
            totalRounds: gameState.currentRound -1,
        });
    }

    setGameState({
      currentRound: 1,
      totalScore: 0,
      circles: [{ id: 0, x: 0, y: 0, radius: INITIAL_BOARD_RADIUS }],
      isGameOver: false,
      message: null,
    });
  }, [sessionId, gameState.totalScore, gameState.currentRound]);

  // Effect to handle saving data on game over
  useEffect(() => {
    if (gameState.isGameOver && sessionId) {
        saveGameData('game_end', {
            finalScore: gameState.totalScore,
            totalRounds: gameState.currentRound -1,
        });
    }
  }, [gameState.isGameOver, gameState.totalScore, gameState.currentRound, sessionId]);

  return { gameState, handleThrow, resetGame };
};