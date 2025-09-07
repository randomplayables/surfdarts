# Surf Darts

Surf Darts is a game of skill and chance built with React, TypeScript, and Vite, using the Kaplay.js game engine.

## Overview

The core Surf Darts concept involves throwing darts at a moving dartbooard (as if the dartboard were surfing). Each successful throw creates a new, smaller target circle for the next round. The game challenges players to maintain accuracy on an unpredictable, moving target, with a unique scoring system rooted in the geometry of the circles created.

## Game Rules

### Goal

Score as many points as possible across five rounds by hitting increasingly smaller target circles on a moving board.

### Gameplay

1.  **Starting the Game**: The game begins with a single large circle (Circle O) moving on the screen.
2.  **Throwing a Dart**: Click the dart board to place your dart.
3.  **Round Progression**:
    * **Round 1**: Your first throw must land *inside* the initial large circle. The point where your dart lands becomes the center of the next target (Circle A), and its radius is the distance from your landing point to the center of Circle O.
    * **Rounds 2-5**: For each subsequent round, you must land your dart inside the newest target circle (the "focal circle").
4.  **Scoring**:
    * Your score for each successful throw is calculated based on a cumulative formula. You earn points for the inverse of the distance from your landing spot to the center of the target circle, plus bonus points for also being inside the circles from prior rounds.
5.  **Ending the Game**: The game ends immediately if you miss the current target circle, or after successfully completing 5 rounds.

## Scoring System

The scoring system rewards precision by awarding points based on the reciprocal of distances to various circle centers. For each successful throw in round n, your score is calculated as:

For round n (where n = 1, 2, 3, 4, or 5), the score is:
Score(n) = Σ[i=0 to n-1] Indicator(i) × (1 / distance_i)

Where:
- Indicator(i) = 1 if the dart is inside all circles from the focal circle down through the circle at index (n-1-i), otherwise 0
- distance_i = distance from the dart's landing point to the center of circle at index (n-1-i)
- The summation adds reciprocal distances only for circles that contain the dart

### Scoring Examples
Round 1: You throw at Circle O

If you hit inside O at point a: Score = 1/r_a (where r_a is distance from a to O's center)
This distance r_a also becomes the radius of Circle A

Round 2: You throw at Circle A (centered at point a)

If you hit inside A at point b:
- Base score: 1/r_b (distance from b to a)
- Bonus if b is also inside O: + 1/r_b0 (distance from b to O's center)
- Total: Score = 1/r_b + Indicator(b∈O) × 1/r_b0

Round 3: You throw at Circle B (centered at point b)

If you hit inside B at point c:
- Base score: 1/r_c (distance from c to b)
- Bonus if c is also inside A: + 1/r_ca (distance from c to a)
- Bonus if c is also inside A AND O: + 1/r_c0 (distance from c to O's center)
- Total: Score = 1/r_c + Indicator(c∈A) × 1/r_ca + Indicator(c∈A∩O) × 1/r_c0

The pattern continues through rounds 4 and 5, with each round potentially earning more bonus points for landing within multiple previous circles.

## Strategy Tips
- Precision Pays: Landing closer to a circle's center creates a smaller next target but yields higher scores
- Risk vs Reward: Aiming for the center maximizes points but makes subsequent rounds harder
Cumulative Bonuses: Later rounds can earn substantial bonus points by staying within earlier circles
- Motion Mastery: Learning the board's movement patterns helps with accurate throws