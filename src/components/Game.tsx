import React, { useEffect, useRef } from 'react';
import kaplay from 'kaplay';
import type { Circle, ThrowData } from '../types';

interface GameProps {
  circles: Circle[]; // All circles to be drawn
  onThrow: (throwData: ThrowData) => void;
  isGameOver: boolean;
}

const Game: React.FC<GameProps> = ({ circles, onThrow, isGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kaplayInstance = useRef<any>(null);

  // Motion parameters live in a ref so board.onUpdate can see fresh values
  const motionRef = useRef({
    baseRot: 15,         // base deg/sec
    rotSpeed: 15,
    targetRot: 15,
    vyAmp: 20,
    targetVyAmp: 20,
    vyFreq: 0.5,
    targetVyFreq: 0.5,
    vxAmp: 8,
    targetVxAmp: 8,
    vxFreq: 0.7,
    targetVxFreq: 0.7,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    lastJitterAt: 0,
    retargetAt: 0,
    round: 1,
  });

  // Keep round count in sync (affects difficulty scaling)
  useEffect(() => {
    // circles: [O, A, B, ...] — round is circles.length (O present at start)
    const round = Math.max(1, circles.length);
    const m = motionRef.current;
    m.round = round;
    // Slightly increase the base rotation speed with each round (subtle)
    m.baseRot = 15 + (round - 1) * 4;
    // When round changes, ask for a retarget soon to feel different each round
    m.retargetAt = 0; // force immediate retarget on next update tick
  }, [circles.length]);

  useEffect(() => {
    if (!canvasRef.current || kaplayInstance.current) return;

    const k = kaplay({
      canvas: canvasRef.current,
      width: 800,
      height: 600,
      background: [30, 30, 40],
    });

    kaplayInstance.current = k;

    const board = k.add([
      k.pos(k.center()),
      k.rotate(0),
      k.anchor('center'),
      'board',
    ]);

    let time = 0;

    board.onUpdate(() => {
      if (isGameOver) {
        // Freeze rotation when the game stops (matches previous behavior)
        board.angle = 0;
        return;
      }

      const m = motionRef.current;
      time += k.dt();

      // Occasionally retarget motion parameters to add unpredictability
      if (m.retargetAt <= 0 || time - m.retargetAt > 2.5) {
        // Round-based scaling (kept mild)
        const r = m.round;
        const ampBoost = 6 + (r - 1) * 4;
        const speedJitter = 0.9 + Math.random() * 0.2;

        m.targetRot = m.baseRot * speedJitter;
        m.targetVyAmp = 16 + ampBoost + Math.random() * 10;
        m.targetVxAmp = 8 + Math.max(0, r - 1) * 4 + Math.random() * 8;

        m.targetVyFreq = 0.45 + Math.random() * 0.25; // 0.45–0.70
        m.targetVxFreq = 0.55 + Math.random() * 0.35; // 0.55–0.90

        // Small chance of a brief speed burst
        if (Math.random() < 0.08) {
          m.targetRot *= 1.6; // temporary spike
        }

        m.retargetAt = time;
      }

      // Smoothly ease toward targets
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      m.rotSpeed = lerp(m.rotSpeed, m.targetRot, 0.02);
      m.vyAmp   = lerp(m.vyAmp,   m.targetVyAmp, 0.02);
      m.vxAmp   = lerp(m.vxAmp,   m.targetVxAmp, 0.02);
      m.vyFreq  = lerp(m.vyFreq,  m.targetVyFreq, 0.02);
      m.vxFreq  = lerp(m.vxFreq,  m.targetVxFreq, 0.02);

      // Lissajous-style center motion + rotation
      const cx = k.width() / 2;
      const cy = k.height() / 2;

      board.pos.x = cx + Math.sin(time * m.vxFreq + m.phaseX) * m.vxAmp;
      board.pos.y = cy + Math.sin(time * m.vyFreq + m.phaseY) * m.vyAmp;

      board.angle += k.dt() * m.rotSpeed;
    });

    k.onClick(() => {
      if (isGameOver) return;

      // 1) Get mouse position in world coordinates
      const worldPos = k.toWorld(k.mousePos());

      // 2) Translate by the board's inverted position
      const translatedPos = worldPos.sub(board.pos);

      // 3) Un-rotate by the board's angle (convert deg → rad, negate)
      const angleRad = -k.deg2rad(board.angle);
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);

      const localX = translatedPos.x * cosA - translatedPos.y * sinA;
      const localY = translatedPos.x * sinA + translatedPos.y * cosA;

      onThrow({ x: localX, y: localY });
    });
  }, [isGameOver, onThrow]);

  useEffect(() => {
    const k = kaplayInstance.current;
    if (!k) return;

    const board = k.get('board')[0];
    if (!board) return;

    // Manually iterate and destroy each child object.
    for (const child of [...board.children]) {
      child.destroy();
    }

    [...circles].reverse().forEach((circle, index) => {
      const isTarget = index === 0;
      board.add([
        k.pos(circle.x, circle.y),
        k.circle(circle.radius),
        k.anchor('center'),
        k.color(k.Color.fromHex(isTarget ? '#ffeb3b' : '#607d8b')),
        k.opacity(isTarget ? 0.3 : 0.15),
        k.outline(2, k.Color.fromHex(isTarget ? '#fbc02d' : '#455a64')),
      ]);
    });
  }, [circles]);

  return <canvas ref={canvasRef} className="game-canvas"></canvas>;
};

export default Game;