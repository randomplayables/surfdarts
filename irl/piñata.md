# Playing Surf Darts In Real Life

This guide explains how to play a physical version of Surf Darts using simple materials, with a fun twist inspired by piñatas to simulate a moving target!

## Materials Needed
- A large sheet of sturdy paper or poster board to serve as the dartboard
- A rope or sturdy string
- A hole punch
- A place to hang the board (like a doorway, a ceiling hook, or a tree branch)
- A compass for drawing circles accurately
- A ruler for measuring distances (in cm or inches)
- A fine-tipped marker or pen to act as your "dart"
- Paper and a pen for scoring
- Different colored markers to distinguish circles (optional but helpful)

## Setup
**Draw the Board**: Use your compass to draw a large "Original Circle" (Circle O) on your poster board. A radius of 25 cm (~10 inches) is a good start.

**Mark the Center**: Clearly mark the exact center point of Circle O with a small dot or cross.

**Hang the Board**: Punch a hole near the top edge of the poster board, thread the string through it, and hang the board so it can swing freely at a comfortable height.

## Gameplay
This version is best played with at least two people: a "Player" who throws the dart and a "Mover" who controls the board. The game is played over a maximum of five rounds and ends immediately if the Player misses the target circle.

### Round 1: Aim for Swinging Circle O
- The Mover stands to the side and gently pushes the hanging board to make it swing.
- The Player stands a short distance away and throws the marker (the "dart") at the moving board, aiming for anywhere inside Circle O.
- If the dart lands outside Circle O, the game is over.
- If it hits inside, mark the landing spot as Point A. This will be the center of your next circle.
- Measure the distance from Point A to the center of Circle O. This distance is the radius for Circle A.
- Using your compass, draw Circle A centered on Point A with the radius you just measured.

### Subsequent Rounds (2-5)
Continue the same pattern:
- The Mover swings the board
- The Player aims for the newest (focal) circle
- A hit creates a new circle; a miss ends the game
- Each new circle is centered at the hit point with radius equal to the distance from that point to the previous circle's center

## Scoring System

The scoring rewards precision with cumulative bonuses. Your score increases based on how close you get to circle centers, with additional bonuses for landing within multiple circles.

### Scoring Formula

For round n, your score is the sum of reciprocals of distances to specific circle centers, but only for terms where your dart lands inside all required circles:

**Score(round n) = Σ[for each valid term] (1 / distance to target center)**

Each term in the sum requires your dart to be inside progressively more circles:
- Term 1: Just inside the focal circle → add 1/(distance to focal center)
- Term 2: Inside focal AND previous circle → add 1/(distance to previous center)
- Term 3: Inside focal AND two previous circles → add 1/(distance to center two circles back)
- And so on...

### Detailed Scoring Example

**Setup**: Circle O has radius 25 cm, center at origin.

**Round 1**:
- You hit Circle O at Point A, which is 10 cm from O's center
- Score calculation:
  - You're inside Circle O ✓
  - Distance to O's center = 10 cm
  - Round 1 Score = 1/10 = 0.10 points
- Circle A is drawn centered at Point A with radius 10 cm

**Round 2**:
- You hit Circle A at Point B, which is 4 cm from A's center
- Score calculation:
  - Term 1: Inside Circle A ✓ → add 1/4 = 0.25
  - Term 2: Inside Circle A ✓ AND Circle O ✓ → add 1/(distance from B to O's center)
    - Let's say B is 8 cm from O's center → add 1/8 = 0.125
  - Round 2 Score = 0.25 + 0.125 = 0.375 points
- Circle B is drawn centered at Point B with radius 4 cm

**Round 3**:
- You hit Circle B at Point C, which is 2 cm from B's center
- Score calculation:
  - Term 1: Inside Circle B ✓ → add 1/2 = 0.50
  - Term 2: Inside Circle B ✓ AND Circle A ✓ → add 1/(distance from C to A's center)
    - Let's say C is 5 cm from A's center → add 1/5 = 0.20
  - Term 3: Inside Circle B ✓ AND Circle A ✓ AND Circle O ✓ → add 1/(distance from C to O's center)
    - Let's say C is 7 cm from O's center → add 1/7 ≈ 0.143
  - Round 3 Score = 0.50 + 0.20 + 0.143 = 0.843 points
- Circle C is drawn centered at Point C with radius 2 cm

**Total Score After Three Rounds**: 0.10 + 0.375 + 0.843 = 1.318 points

### Strategy Tips
- **Center Shots**: Hitting near a circle's center creates a tiny next target but maximizes your score
- **Safe Shots**: Hitting near the edge gives you a larger next target but lower scores
- **Cumulative Value**: Later rounds can score much higher due to the cumulative bonus system
- **Risk Management**: Balance aggressive center shots with the risk of missing in future rounds