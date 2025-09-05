import { useState, useEffect } from 'react';
import './App.css';
import Game from './components/Game';
import { useSurfDarts } from './hooks/useSurfDarts';
import { initGameSession } from './services/apiService';

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { gameState, handleThrow, resetGame } = useSurfDarts(sessionId);

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

      <div className="game-container" style={{ position: 'relative' }}>
        <Game
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
            <button onClick={resetGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;