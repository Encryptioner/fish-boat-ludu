# 🐟 Fish & Boat Ladders Game 🚤

A modern, browser-based variant of the classic Snakes and Ladders board game. Instead of snakes and ladders, this game features hungry fish that drag players down and helpful boats that carry players up to safety!

## 🎮 Game Features

### Core Gameplay
- **Two-player turn-based gameplay** with animated dice rolling
- **Professional board design** with 100 squares in traditional zigzag pattern
- **Fish (🦈🌊)** replace snakes - drag players down when landed on
- **Boats (🚢⛵)** replace ladders - lift players up when discovered
- **Special dice rule**: Rolling a 1 grants an extra turn
- **Win condition**: First player to reach exactly square 100 wins

### Visual & Audio Features
- **Animated game pieces** with smooth movement transitions
- **Sound effects** for dice rolling, fish bites, boat rescues, and victories
- **Smart animations** - only upcoming fish/boats animate to reduce distraction
- **Custom notifications** for special events and game status
- **Professional UI** with gradient backgrounds and hover effects

### Game Management
- **Persistent game state** - resume games after browser reload
- **Player statistics** tracking wins and total games played
- **Move history** with timestamps for each game session
- **Editable player names** that persist across sessions
- **Custom modal dialogs** replacing native browser popups

### Responsive Design
- **Mobile-first design** optimized for touch interactions
- **Hamburger menu** for mobile game options
- **Webview compatible** for mobile app integration
- **All key elements visible** without scrolling on mobile devices

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation & Setup
1. **Clone or download** the project files
2. **Open** `index.html` in your web browser
3. **Start playing** immediately - no additional setup required!

### Development Setup
For development with live reloading:

1. Use `Open with Live Server`, to open the file `index.html`. It will load the file in browser and it would do live reload
2. Try command line
```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js serve package
npx serve .

# Using any other static file server
# Then open http://localhost:8000
```

## 🎯 How to Play

### Basic Rules
1. **Players take turns** rolling the dice by clicking "ROLL DICE"
2. **Move your piece** the number of squares shown on the dice
3. **Special squares**:
   - **Fish squares** (🦈): Move down to the fish's tail position
   - **Boat squares** (⛵): Move up to the boat's destination
4. **Extra turns**: Rolling a 1 gives you another turn
5. **Winning**: First player to land exactly on square 100 wins

### Game Controls
- **Roll Dice**: Click the dice or "ROLL DICE" button
- **New Game**: Start a fresh game (asks for confirmation)
- **History**: View move history and statistics
- **Clear Stats**: Reset all game statistics (asks for confirmation)
- **Player Names**: Click on player names to edit them

### Mobile Controls
- **Dice**: Tap the dice area at the bottom of the screen
- **Menu**: Use the hamburger menu (≡) for game options
- **Responsive**: All features work seamlessly on mobile devices

## 🏗️ Technical Architecture

### Core Technologies
- **HTML5** - Semantic structure with mobile-optimized meta tags
- **CSS3** - Grid layout, animations, and responsive design
- **Vanilla JavaScript** - No external dependencies, ES6+ features

### Game Architecture
- **Class-based design** with `FishBoatLaddersGame` main class
- **Event-driven** user interactions with proper event handling
- **State management** using localStorage for persistence
- **Modular methods** for board creation, player movement, and UI updates

### Key Components
- **Board Generation**: Creates 100-square grid in zigzag pattern
- **Piece Movement**: Smooth CSS transitions with collision detection
- **Special Squares**: Fish and boat mechanics with visual feedback
- **Audio System**: Web Audio API for game sound effects
- **Storage System**: JSON-based localStorage for game state and statistics

### Performance Features
- **Selective animations** - only relevant fish/boats animate
- **Efficient DOM updates** - minimal redraws and targeted updates
- **Optimized mobile layout** - no scrolling required
- **Fast loading** - no external dependencies or large assets

## 🎨 Customization

### Game Rules
Modify constants in `script.js`:
```javascript
static EXTRA_TURN_ROLL = 1;     // Change extra turn trigger
static ANIMATION_RANGE = 20;    // Adjust animation distance
static WINNING_SQUARE = 100;    // Modify win condition
```

### Visual Styling
Edit `style.css` for:
- **Colors and themes** - Update CSS custom properties
- **Animation speeds** - Modify transition durations
- **Layout spacing** - Adjust margins and padding
- **Responsive breakpoints** - Change mobile view triggers

### Game Features
Extend functionality in `script.js`:
- **Add new sound effects** using the `playSound()` method
- **Create custom notifications** with `showNotification()`
- **Modify fish/boat positions** in constructor arrays
- **Add new game modes** by extending the class

## 🐛 Troubleshooting

### Common Issues
- **Game doesn't load**: Ensure you're opening `index.html` in a browser, not viewing the file
- **Sounds don't play**: Check browser audio permissions and volume settings
- **Mobile layout issues**: Verify viewport meta tag is present in HTML
- **State not saving**: Check if localStorage is enabled in browser settings

### Browser Compatibility
- **Chrome/Edge**: Full support for all features
- **Firefox**: Full support for all features
- **Safari**: Full support (mobile Safari included)
- **Mobile browsers**: Optimized for touch interactions

### Performance Tips
- **Clear browser cache** if experiencing display issues
- **Close other tabs** for optimal performance on older devices
- **Use latest browser version** for best compatibility

## 🤝 Contributing

### Development Guidelines
1. **Follow existing code style** and patterns
2. **Test on multiple devices** and browsers
3. **Maintain responsive design** principles
4. **Document new features** with JSDoc comments
5. **Keep dependencies minimal** - prefer vanilla solutions

### Feature Requests
- **Game modes**: Different board sizes or rule variations
- **Themes**: Additional visual themes or color schemes
- **Multiplayer**: Online multiplayer functionality
- **AI opponents**: Computer-controlled players

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Inspired by** the classic Snakes and Ladders board game
- **Built with** modern web technologies for universal accessibility
- **Designed for** players of all ages from children to elderly
- **Optimized for** both desktop and mobile gaming experiences

---

**Enjoy the game! 🎮** Cast off with the boats and avoid the hungry fish in this exciting nautical adventure!