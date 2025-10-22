# Google Analytics Setup Guide

Quick setup guide for Google Analytics 4 in Fish & Boat Ludo.

## Quick Setup

### 1. Get Measurement ID

1. Visit [analytics.google.com](https://analytics.google.com/)
2. Admin → Data Streams → Your Stream
3. Copy your Measurement ID (G-XXXXXXXXXX)

### 2. Configure

Open `analytics.js`:

```javascript
const GOOGLE_ANALYTICS_CONFIG = {
  measurementId: 'G-YOUR-ID-HERE', // Replace with your ID
  enabled: true,                     // Enable tracking
  trackInDevelopment: false,         // Test locally
};
```

### 3. Deploy

Upload all files to your web server or GitHub Pages.

### 4. Verify

Check browser console for:
```
[Google Analytics] Initialized successfully with ID: G-XXXXXXXXXX
```

## Tracked Events

The app can track:

- **Game Start**: `trackGameStart()`
- **Game Win**: `trackGameWin(winner, moves)`
- **Dice Roll**: `trackDiceRoll(value)`
- **Fish Encounter**: `trackFishEncounter(from, to)`
- **Boat Encounter**: `trackBoatEncounter(from, to)`

## Custom Tracking

Add this to your `script.js` where needed:

```javascript
// Track game start (when first dice is rolled)
trackGameStart();

// Track game win
trackGameWin('Player 1', 45);

// Track dice roll
trackDiceRoll(6);

// Track fish encounter
trackFishEncounter(98, 78);

// Track boat encounter
trackBoatEncounter(2, 38);
```

## Usage Examples

```javascript
// Track custom event
trackEvent('custom_event', {
  category: 'Category',
  action: 'Action',
  label: 'Label'
});
```

## Integration Guide

To integrate analytics into your game:

1. **Game Start**: Add `trackGameStart()` in the first dice roll
2. **Dice Roll**: Add `trackDiceRoll(diceValue)` after rolling
3. **Fish/Boat**: Add tracking when player lands on special squares
4. **Game Win**: Add `trackGameWin(playerName, totalMoves)` when game ends

Example in `script.js`:

```javascript
rollDice() {
  const diceValue = Math.floor(Math.random() * 6) + 1;

  // Track dice roll
  if (typeof trackDiceRoll === 'function') {
    trackDiceRoll(diceValue);
  }

  // Rest of your game logic...
}
```

## Privacy First

- **Disabled by default** - respects user privacy
- **No tracking on localhost** - clean dev environment
- **Configurable** - easy to enable/disable

## Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [Google Analytics Script](../analytics.js)
