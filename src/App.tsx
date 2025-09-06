import { useState, useEffect } from 'react';
import './App.css';
import Game from './components/Game';
import { useSurfDarts } from './hooks/useSurfDarts';
import { initGameSession } from './services/apiService';

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [gameInstance, setGameInstance] = useState<number>(0); // increment to remount <Game />

  const { gameState, handleThrow, resetGame } = useSurfDarts(sessionId, {
    instructionsEnabled: showInstructions,
    instructionDurationMs: 1200, // shorter display time
  });

  // Initialize the game session on component mount
  useEffect(() => {
    let mounted = true;
    initGameSession().then(session => {
      if (!mounted) return;
      console.log("Game session initialized:", session);
      setSessionId(session.sessionId);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePlayAgain = () => {
    // Reset gameplay state (score, circles, round, etc.)
    resetGame();
    // Hard reset motion by remounting the Game component
    setGameInstance((prev) => prev + 1);
  };

  // Don't render gameplay until we have a sessionId
  if (!sessionId) {
    return (
      <div className="app-container">
        <h1>Surf Darts</h1>

        <div className="scoreboard">
          <div className="scoreboard-item">
            <span>Status</span>
            Connecting to platform...
          </div>
        </div>

        <div className="game-container" style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <p>Preparing your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>Surf Darts</h1>

      <div className="scoreboard">
        <div className="scoreboard-item">
          <span>Round</span>
          {gameState.currentRound} / 5
        </div>
        <div className="scoreboard-item">
          <span>Total Score</span>
          {gameState.totalScore.toFixed(2)}
        </div>
      </div>

      {/* Minimal toggle control (no style changes elsewhere) */}
      <div style={{ marginTop: '0.25rem' }}>
        <label style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showInstructions}
            onChange={(e) => setShowInstructions(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Show tips
        </label>
      </div>

      <div className="game-container" style={{ position: 'relative' }}>
        <Game
          key={gameInstance}             // ← remounts Game on Play Again
          circles={gameState.circles}
          onThrow={handleThrow}
          isGameOver={gameState.isGameOver}
        />
        {gameState.message && !gameState.isGameOver && (
          <div className="game-message">
            <p>{gameState.message}</p>
          </div>
        )}
      </div>

      {gameState.isGameOver && (
        <div className="final-score-overlay">
          <div className="final-score-modal">
            <h2>{gameState.message}</h2>
            <p>Final Score: {gameState.totalScore.toFixed(2)}</p>
            <button onClick={handlePlayAgain}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;