# Surf Darts

Surf Darts is a game of skill and chance built with React, TypeScript, and Vite, using the Kaplay.js game engine.

## Overview

The core Surf Darts concept involves throwing darts at a moving dartbooard (as if the dartboard were surfing). Each successful throw creates a new, smaller target circle for the next round. The game challenges players to maintain accuracy on an unpredictable, moving target, with a unique scoring system rooted in the geometry of the circles created.

## Game Rules

### Goal

The objective is to score as many points as possible across five possible rounds.

### Gameplay

1.  **Starting the Game**: The game begins with a single large circle (Circle O) moving on the screen.
2.  **Throwing a Dart**: Click the dart board to place your dart.
3.  **Round Progression**:
    * **Round 1**: Your first throw must land *inside* the initial large circle. The point where your dart lands becomes the center of the next target (Circle A), and its radius is the distance from your landing point to the center of Circle O.
    * **Rounds 2-5**: For each subsequent round, you must land your dart inside the newest target circle (the "focal circle").
4.  **Scoring**:
    * Your score for each successful throw is calculated based on a cumulative formula. You earn points for the inverse of the distance from your landing spot to the center of the target circle, plus bonus points for also being inside the circles from prior rounds.
5.  **Ending the Game**: The game ends immediately if you throw a dart and it lands *outside* the current focal circle. Otherwise, the game lasts five rounds.