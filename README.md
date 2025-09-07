# Surf Darts

Surf Darts is a game of skill and chance built with React, TypeScript, and Vite, using the Kaplay.js game engine.

## Overview

The core Surf Darts concept involves throwing darts at a moving dartboard (as if the dartboard were surfing). Each successful throw creates a new, smaller target circle for the next round. The game challenges players to maintain accuracy on an unpredictable, moving target, with a unique scoring system that rewards precision through geometric relationships between the circles created.

## Game Rules

### Goal

Score as many points as possible across five rounds by hitting increasingly smaller target circles on a moving board.

### Gameplay

1. **Starting the Game**: The game begins with a single large circle (Circle O) moving on the screen.

2. **Throwing a Dart**: Click anywhere on the moving board to throw your dart.

3. **Round Progression**:
   - **Round 1**: Your dart must land inside Circle O. The landing point becomes the center of Circle A, with radius equal to the distance from your dart to O's center.
   - **Round 2**: Your dart must land inside Circle A. The landing point becomes the center of Circle B, with radius equal to the distance from your dart to A's center.
   - **Rounds 3-5**: Continue this pattern through Circles C, D, and E.

4. **Game Ending**: The game ends immediately if you miss the current target circle, or after successfully completing 5 rounds.

### Scoring System

The scoring system rewards precision by awarding points based on the reciprocal of distances to various circle centers. For each successful throw in round n, your score is calculated as:

#### Mathematical Formula

For round n (where n = 1, 2, 3, 4, or 5), the score is:

**Score(n) = Σ[i=0 to n-1] Indicator(i) × (1 / distance_i)**

Where:
- **Indicator(i)** = 1 if the dart is inside all circles from the focal circle down through the circle at index (n-1-i), otherwise 0
- **distance_i** = distance from the dart's landing point to the center of circle at index (n-1-i)
- The summation adds reciprocal distances only for circles that contain the dart

#### Scoring Examples

**Round 1**: You throw at Circle O
- If you hit inside O at point a: Score = 1/r_a (where r_a is distance from a to O's center)
- This distance r_a also becomes the radius of Circle A

**Round 2**: You throw at Circle A (centered at point a)
- If you hit inside A at point b:
  - Base score: 1/r_b (distance from b to a)
  - Bonus if b is also inside O: + 1/r_b0 (distance from b to O's center)
  - Total: Score = 1/r_b + Indicator(b∈O) × 1/r_b0

**Round 3**: You throw at Circle B (centered at point b)
- If you hit inside B at point c:
  - Base score: 1/r_c (distance from c to b)
  - Bonus if c is also inside A: + 1/r_ca (distance from c to a)
  - Bonus if c is also inside A AND O: + 1/r_c0 (distance from c to O's center)
  - Total: Score = 1/r_c + Indicator(c∈A) × 1/r_ca + Indicator(c∈A∩O) × 1/r_c0

The pattern continues through rounds 4 and 5, with each round potentially earning more bonus points for landing within multiple previous circles.

### Strategy Tips

- **Precision Pays**: Landing closer to a circle's center creates a smaller next target but yields higher scores
- **Risk vs Reward**: Aiming for the center maximizes points but makes subsequent rounds harder
- **Cumulative Bonuses**: Later rounds can earn substantial bonus points by staying within earlier circles
- **Motion Mastery**: Learning the board's movement patterns helps with accurate throws