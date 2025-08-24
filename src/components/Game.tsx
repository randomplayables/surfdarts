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
        k.anchor("center"),
        "board",
    ]);

    let time = 0;
    board.onUpdate(() => {
        if (isGameOver) {
            board.angle = 0;
            return;
        }
        time += k.dt();
        board.pos.y = k.height() / 2 + Math.sin(time * 0.5) * 20;
        board.angle += k.dt() * 15;
    });

    k.onClick(() => {
        if (isGameOver) return;
        
        // --- START FIX ---
        // Manually calculate the local coordinates of the click
        // relative to the moving, rotating board.
        
        // 1. Get mouse position in world coordinates
        const worldPos = k.toWorld(k.mousePos());
        
        // 2. Translate the point by the board's inverted position
        const translatedPos = worldPos.sub(board.pos);
        
        // 3. Un-rotate the point by the board's angle
        const angleRad = -k.deg2rad(board.angle); // Use negative angle
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        
        const localX = translatedPos.x * cosA - translatedPos.y * sinA;
        const localY = translatedPos.x * sinA + translatedPos.y * cosA;
        
        onThrow({ x: localX, y: localY });
        // --- END FIX ---
    });
    
  }, [isGameOver, onThrow]);

  useEffect(() => {
      const k = kaplayInstance.current;
      if (!k) return;

      const board = k.get("board")[0];
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
              k.anchor("center"),
              k.color(k.Color.fromHex(isTarget ? "#ffeb3b" : "#607d8b")),
              k.opacity(isTarget ? 0.3 : 0.15),
              k.outline(2, k.Color.fromHex(isTarget ? "#fbc02d" : "#455a64")),
          ]);
      });

  }, [circles]);


  return <canvas ref={canvasRef} className="game-canvas"></canvas>;
};

export default Game;