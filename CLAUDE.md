# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Fish & Boat Ladders game - a browser-based variant of the classic Snakes and Ladders board game. Instead of snakes and ladders, it uses fish (that drag players down) and boats (that carry players up). The game is built as a single-page web application with vanilla HTML, CSS, and JavaScript.

## Architecture

### File Structure
- `index.html` - Main HTML structure with game board and UI elements
- `script.js` - Core game logic implemented as `FishBoatLaddersGame` class
- `style.css` - Complete styling with responsive design and animations
- `task-1-initial-setup.md` - Development requirements and iteration notes

### Game Architecture
The game is implemented using a single JavaScript class `FishBoatLaddersGame` with the following key components:

**Game State Management:**
- Player positions and turn tracking
- Fish positions (like snake heads) - take players down
- Boat positions (like ladder bottoms) - take players up
- Game statistics stored in localStorage

**Core Systems:**
- **Board Generation**: Creates 100-square grid in traditional snake & ladders zigzag pattern
- **Dice Rolling**: Animated dice with 6-sided values and special rules (rolling 6 = extra turn)
- **Movement Animation**: Smooth CSS transitions for piece movement
- **Special Squares**: Fish and boat mechanics with position teleportation
- **Win Condition**: First player to reach exactly square 100 wins

### Key Game Logic
- Fish positions: `{98: 78, 95: 75, 93: 73, 87: 24, 64: 60, 62: 19, 56: 53, 49: 11, 47: 26, 16: 6}`
- Boat positions: `{2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98}`
- Players must roll exact number to reach square 100
- Rolling 6 grants an additional turn
- Game statistics persist in browser localStorage

## Development Commands

This is a client-side only project with no build process. To develop:

```bash
# Serve the files (any static server)
python -m http.server 8000
# or
npx serve .
# or simply open index.html in browser
```

## Code Patterns

- **CSS**: Uses CSS Grid for board layout, CSS animations for dice rolling and piece movement
- **JavaScript**: ES6+ class-based architecture with event-driven gameplay
- **State Management**: Simple object-based state with localStorage persistence
- **UI Updates**: Direct DOM manipulation with classList and style updates
- **Responsive Design**: Mobile-friendly with media queries for different screen sizes

## Game Features

- Two-player turn-based gameplay
- Animated dice rolling with emoji representation
- Smooth piece movement animations
- Visual feedback for active player and game states
- Win statistics tracking
- New game and clear statistics functionality
- Professional UI with gradient backgrounds and hover effects
- Fish and boat indicators on special squares
- Responsive design for mobile and desktop

## Testing

No formal test suite exists. Manual testing involves:
- Playing complete games to verify win conditions
- Testing fish and boat teleportation mechanics
- Verifying dice roll accuracy and extra turn logic
- Checking localStorage persistence
- Testing responsive design on different screen sizes