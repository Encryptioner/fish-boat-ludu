# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Fish & Boat Ladders game - a browser-based variant of the classic Snakes and Ladders board game. Instead of snakes and ladders, it uses fish (that drag players down) and boats (that carry players up). The game is built as a single-page web application with vanilla HTML, CSS, and JavaScript.

## Architecture

### File Structure
- `index.html` - Main HTML structure with game board and UI elements
- `script.js` - Core game logic implemented as `FishBoatLaddersGame` class with modern coding standards
- `style.css` - Complete styling with responsive design and animations
- `README.md` - Comprehensive project documentation for users and developers
- `CLAUDE.md` - Development guidance for AI assistance (this file)
- `ai-instructions/task-1-initial-setup.md` - Development iteration history through 17 instruction lists

### Game Architecture
The game is implemented using a single JavaScript class `FishBoatLaddersGame` with the following key components:

**Game State Management:**
- Player positions and turn tracking
- Fish positions (like snake heads) - take players down
- Boat positions (like ladder bottoms) - take players up
- Game statistics stored in localStorage

**Core Systems:**
- **Board Generation**: Creates 100-square grid in traditional snake & ladders zigzag pattern
- **Dice Rolling**: Animated dice with 6-sided values and special rules (rolling 1 = extra turn)
- **Movement Animation**: Smooth CSS transitions for piece movement with enhanced visibility
- **Special Squares**: Fish and boat mechanics with SVG-based visual connections
- **Audio System**: Web Audio API for dice rolling, fish bites, boat rescues, and victory sounds
- **Mobile Optimization**: Responsive design with hamburger menu and optimized layout
- **Win Condition**: First player to reach exactly square 100 wins

### Key Game Logic
- Fish positions: `{98: 78, 95: 75, 93: 73, 87: 24, 64: 60, 62: 19, 56: 53, 49: 11, 47: 26, 16: 6}`
- Boat positions: `{2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98}`
- Players must roll exact number to reach square 100
- Rolling 1 grants an additional turn (changed from rolling 6)
- Smart animations: Only fish/boats within 20 squares of furthest player animate
- Game statistics and player names persist in browser localStorage
- Enhanced player pieces with glowing effects for better visibility

## Development Commands

This is a client-side only project with no build process. To develop:

### Recommended: Live Server
1. Use VS Code with "Live Server" extension
2. Right-click `index.html` and select "Open with Live Server"
3. Provides live reload during development

### Alternative: Command Line
```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js serve package
npx serve .

# Then open http://localhost:8000
# Or simply open index.html directly in browser
```

## Code Patterns & Standards

- **CSS**: Uses CSS Grid for board layout, responsive design with mobile-first approach
- **JavaScript**: ES6+ class-based architecture with static constants and JSDoc documentation
- **State Management**: Object-based state with enhanced localStorage persistence and error handling
- **UI Updates**: Direct DOM manipulation with classList and style updates, custom modal dialogs
- **Responsive Design**: Mobile-optimized with hamburger menu and optimized layouts
- **Audio**: Web Audio API for synthesized sound effects
- **Error Handling**: Try-catch blocks with proper fallbacks and data validation
- **Performance**: Selective animations and efficient DOM updates

## Game Features

- Two-player turn-based gameplay with editable player names
- Animated dice rolling with emoji representation and sound effects
- Smooth piece movement animations with enhanced visibility
- Visual feedback for active player and game states
- Comprehensive move history with timestamps (12-hour format)
- Win statistics tracking with persistent storage
- Custom modal dialogs for confirmations and input
- Professional UI with gradient backgrounds and hover effects
- SVG-based fish and boat visual connections with smart animations
- Mobile-optimized responsive design with hamburger menu
- Webview-compatible for mobile app development
- Complete game state persistence across browser sessions
- Sound effects for dice rolling, fish bites, boat rescues, and victories

## Development Principles

### Code Quality
- **Modern Standards**: ES6+ features with static constants and proper error handling
- **Documentation**: Comprehensive JSDoc comments for all public methods
- **Maintainability**: Clear method separation and modular architecture
- **Performance**: Optimized animations and efficient DOM updates
- **Accessibility**: Mobile-first design with touch-friendly interactions

### Best Practices Followed
- No external dependencies - pure vanilla JavaScript/CSS/HTML
- Progressive enhancement with fallbacks for older browsers
- Mobile-first responsive design approach
- Semantic HTML structure for better accessibility
- CSS custom properties for consistent theming
- LocalStorage with proper error handling and data validation
- Audio API with graceful degradation if not supported

## Testing

No formal test suite exists. Manual testing involves:
- Playing complete games to verify win conditions
- Testing fish and boat teleportation mechanics
- Verifying dice roll accuracy and extra turn logic (rolling 1)
- Checking localStorage persistence across browser sessions
- Testing responsive design on different screen sizes and orientations
- Verifying mobile hamburger menu functionality
- Testing sound effects and audio fallbacks
- Confirming webview compatibility for mobile app integration