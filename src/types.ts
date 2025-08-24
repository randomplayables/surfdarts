// Defines a circle in the game world
export interface Circle {
  id: number;
  x: number;
  y: number;
  radius: number;
}

// Represents the state of a single round
export interface RoundState {
  roundNumber: number;
  targetCircle: Circle; // The circle the player must hit
  score: number;
}

// The overall state of the game
export interface GameState {
  currentRound: number;
  totalScore: number;
  circles: Circle[]; // A history of all circles created
  isGameOver: boolean;
  message: string | null; // For displaying instructions like "Round 2: Aim for the new circle"
}

// Data passed when a dart throw occurs
export interface ThrowData {
  x: number;
  y: number;
}

// Data structure for saving round information to the backend
export interface RoundData {
    roundNumber: number;
    score: number;
    throwX: number;
    throwY: number;
    circles: Circle[]; // State of all circles at the end of this round
}