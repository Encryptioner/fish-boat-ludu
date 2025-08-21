/**
 * Fish & Boat Ladders Game - A browser-based variant of Snakes and Ladders
 * Features fish (snakes) that drag players down and boats (ladders) that lift players up
 * Supports two players with persistent game state and statistics
 */
class FishBoatLaddersGame {
    // Game constants
    static BOARD_SIZE = 100;
    static GRID_ROWS = 10;
    static GRID_COLS = 10;
    static WINNING_SQUARE = 100;
    static STARTING_SQUARE = 1;
    static EXTRA_TURN_ROLL = 1; // Rolling 1 gives extra turn
    static ANIMATION_RANGE = 20; // Only animate fish/boats within this range

    /**
     * Initialize the Fish & Boat Ladders game
     * Sets up game state, positions, and loads saved data
     */
    constructor() {
        // Game state
        this.currentPlayer = 1;
        this.players = {
            1: { position: FishBoatLaddersGame.STARTING_SQUARE, piece: null, name: 'Player 1' },
            2: { position: FishBoatLaddersGame.STARTING_SQUARE, piece: null, name: 'Player 2' }
        };
        this.isGameOver = false;
        this.isRolling = false;
        this.canRollAgain = false;

        // Webview compatibility flags
        this.isWebView = this.detectWebView();
        this.isLowEndDevice = this.detectLowEndDevice();

        // Fish positions (head -> tail) - like snakes, take you down
        this.fishPositions = {
            98: 78, 95: 75, 93: 73, 87: 24, 64: 60,
            62: 19, 56: 53, 49: 11, 47: 26, 16: 6
        };

        // Boat positions (bottom -> top) - like ladders, take you up  
        this.boatPositions = {
            2: 38, 7: 14, 8: 31, 15: 26, 21: 42,
            28: 84, 36: 44, 51: 67, 71: 91, 78: 98
        };

        // Load game statistics
        this.stats = this.loadGameStats();

        // Game history for current session
        this.gameHistory = [];

        // Load saved game state
        this.loadGameState();

        // Initialize audio context for sound effects
        this.initializeAudio();

        // Initialize the game
        this.initialize();
    }

    /**
     * Get game configuration as a static getter
     */
    static get config() {
        return {
            BOARD_SIZE: this.BOARD_SIZE,
            GRID_ROWS: this.GRID_ROWS,
            GRID_COLS: this.GRID_COLS,
            WINNING_SQUARE: this.WINNING_SQUARE,
            STARTING_SQUARE: this.STARTING_SQUARE,
            EXTRA_TURN_ROLL: this.EXTRA_TURN_ROLL,
            ANIMATION_RANGE: this.ANIMATION_RANGE
        };
    }

    /**
     * Create a debounced version of a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Set up Intersection Observer for performance optimization
     */
    setupIntersectionObserver() {
        // Only observe animations when game board is visible
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Game board is visible, enable animations
                        document.body.classList.add('game-visible');
                    } else {
                        // Game board is not visible, disable heavy animations for performance
                        document.body.classList.remove('game-visible');
                    }
                });
            }, {
                threshold: 0.1
            });

            const gameBoard = document.getElementById('game-board');
            if (gameBoard) {
                observer.observe(gameBoard);
            }
        }
    }

    /**
     * Detect if running in a webview environment
     * @returns {boolean} True if running in a webview
     */
    detectWebView() {
        const userAgent = navigator.userAgent || '';
        return /wv|Version.*Chrome|CriOS|FxiOS|EdgiOS/.test(userAgent) ||
               (window.webkit && window.webkit.messageHandlers !== undefined) ||
               window.AndroidInterface !== undefined;
    }

    /**
     * Detect low-end devices for performance optimization
     * @returns {boolean} True if device is considered low-end
     */
    detectLowEndDevice() {
        // Check for low RAM indicators
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const lowEndConnection = connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        
        // Check for low CPU cores
        const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
        
        // Check for small screen (likely budget device)
        const smallScreen = window.screen && (window.screen.width * window.screen.height) < 1000000;
        
        return lowEndConnection || lowCPU || smallScreen;
    }

    /**
     * Use requestAnimationFrame for smooth animations with mobile optimization
     * @param {Function} callback - Animation callback
     */
    scheduleAnimation(callback) {
        if ('requestAnimationFrame' in window) {
            return requestAnimationFrame(callback);
        } else {
            return setTimeout(callback, 16); // ~60fps fallback
        }
    }

    /**
     * Optimized batch DOM updates for mobile performance
     * @param {Function} updateFunction - Function containing DOM updates
     */
    batchDOMUpdates(updateFunction) {
        // Use requestAnimationFrame to batch DOM updates
        this.scheduleAnimation(() => {
            updateFunction();
        });
    }

    /**
     * Cancel scheduled animation
     * @param {number} id - Animation frame ID
     */
    cancelAnimation(id) {
        if ('cancelAnimationFrame' in window) {
            cancelAnimationFrame(id);
        } else {
            clearTimeout(id);
        }
    }

    initialize() {
        this.createGameBoard();
        this.createPlayerPieces();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateGameStatus('🎮 Welcome! Click "ROLL DICE" to start playing. First player to reach square 100 wins!');
    }

    createGameBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        // Create 100 squares in traditional snake & ladders pattern
        for (let i = 100; i >= 1; i--) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${i}`;
            square.textContent = i;

            // Mark special squares
            if (i === 1) {
                square.classList.add('start');
            } else if (i === 100) {
                square.classList.add('finish');
            }

            // Position squares correctly in snake pattern
            const row = Math.floor((i - 1) / 10);
            const col = (i - 1) % 10;
            
            // Alternate direction for snake pattern (zigzag)
            if (row % 2 === 0) {
                square.style.gridColumn = col + 1;
            } else {
                square.style.gridColumn = 10 - col;
            }
            square.style.gridRow = 10 - row;

            board.appendChild(square);
        }

        // Create visual fish and boat elements after squares are positioned
        this.createFishAndBoatVisuals();
    }

    createFishAndBoatVisuals() {
        const board = document.getElementById('game-board');

        // Get current player positions to determine which fish/boats to animate
        const currentPositions = [this.players[1].position, this.players[2].position];
        const maxPosition = Math.max(...currentPositions);

        // Create fish visuals (like snakes)
        Object.keys(this.fishPositions).forEach(head => {
            const tail = this.fishPositions[head];
            const shouldAnimate = this.shouldAnimateSpecialSquare(parseInt(head), maxPosition);
            this.createFishPath(parseInt(head), parseInt(tail), board, shouldAnimate);
        });

        // Create boat visuals (like ladders)
        Object.keys(this.boatPositions).forEach(bottom => {
            const top = this.boatPositions[bottom];
            const shouldAnimate = this.shouldAnimateSpecialSquare(parseInt(bottom), maxPosition);
            this.createBoatPath(parseInt(bottom), parseInt(top), board, shouldAnimate);
        });
    }

    /**
     * Determines if a special square (fish/boat) should be animated
     * @param {number} squarePosition - The position of the special square
     * @param {number} maxPlayerPosition - The furthest player position
     * @returns {boolean} True if the square should be animated
     */
    shouldAnimateSpecialSquare(squarePosition, maxPlayerPosition) {
        // Disable animations on low-end devices or webviews for better performance
        if (this.isLowEndDevice || this.isWebView) {
            return false;
        }
        
        // Only animate fish/boats that are within animation range of the furthest player
        // This keeps animation focused on relevant upcoming obstacles/helpers
        return squarePosition >= maxPlayerPosition && 
               squarePosition <= maxPlayerPosition + FishBoatLaddersGame.ANIMATION_RANGE;
    }

    /**
     * Calculates the grid position for a given square number
     * Accounts for the zigzag pattern of a traditional Snakes & Ladders board
     * @param {number} squareNumber - Square number (1-100)
     * @returns {Object} Object with row and col properties
     */
    getSquarePosition(squareNumber) {
        const row = Math.floor((squareNumber - 1) / FishBoatLaddersGame.GRID_COLS);
        const col = (squareNumber - 1) % FishBoatLaddersGame.GRID_COLS;
        
        // Adjust for zigzag pattern (even rows go left-to-right, odd rows go right-to-left)
        const actualCol = row % 2 === 0 ? col : (FishBoatLaddersGame.GRID_COLS - 1) - col;
        const actualRow = (FishBoatLaddersGame.GRID_ROWS - 1) - row;
        
        return { row: actualRow, col: actualCol };
    }

    createFishPath(head, tail, board, shouldAnimate = true) {
        const headPos = this.getSquarePosition(head);
        const tailPos = this.getSquarePosition(tail);
        
        // Create fish container
        const fishContainer = document.createElement('div');
        fishContainer.className = 'fish-container';
        
        // Position coordinates as percentages (each square is 10% of board)
        const startX = (headPos.col * 10) + 5; // center of square
        const startY = (headPos.row * 10) + 5;
        const endX = (tailPos.col * 10) + 5;
        const endY = (tailPos.row * 10) + 5;
        
        // Create SVG path for curved fish
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'fish-path');
        svg.setAttribute('viewBox', '0 0 100 100');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Create more elegant curved path that looks like a snake body
        const controlX1 = startX + (endX - startX) * 0.3;
        const controlY1 = startY - 12;
        const controlX2 = startX + (endX - startX) * 0.7;
        const controlY2 = endY - 8;
        
        const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('class', 'fish-line');
        
        svg.appendChild(path);
        
        // Add fish head (bigger, more prominent)
        const fishHead = document.createElement('div');
        fishHead.className = shouldAnimate ? 'fish-head' : 'fish-head no-animation';
        fishHead.style.left = `${startX}%`;
        fishHead.style.top = `${startY}%`;
        fishHead.innerHTML = '🦈'; // Use shark for head to make it more menacing
        
        // Add fish tail (smaller)
        const fishTail = document.createElement('div');
        fishTail.className = shouldAnimate ? 'fish-tail' : 'fish-tail no-animation';
        fishTail.style.left = `${endX}%`;
        fishTail.style.top = `${endY}%`;
        fishTail.innerHTML = '🌊'; // Wave for tail end
        
        fishContainer.appendChild(svg);
        fishContainer.appendChild(fishHead);
        fishContainer.appendChild(fishTail);
        
        // Add tooltip with clear explanation
        fishContainer.title = `Shark! From square ${head} down to ${tail}`;
        
        board.appendChild(fishContainer);
    }

    createBoatPath(bottom, top, board, shouldAnimate = true) {
        const bottomPos = this.getSquarePosition(bottom);
        const topPos = this.getSquarePosition(top);
        
        // Create boat container
        const boatContainer = document.createElement('div');
        boatContainer.className = 'boat-container';
        
        // Position coordinates as percentages
        const startX = (bottomPos.col * 10) + 5;
        const startY = (bottomPos.row * 10) + 5;
        const endX = (topPos.col * 10) + 5;
        const endY = (topPos.row * 10) + 5;
        
        // Create SVG for ladder-like boat path
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'boat-path');
        svg.setAttribute('viewBox', '0 0 100 100');
        
        // Main boat/ladder line (thicker)
        const mainLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        mainLine.setAttribute('x1', startX);
        mainLine.setAttribute('y1', startY);
        mainLine.setAttribute('x2', endX);
        mainLine.setAttribute('y2', endY);
        mainLine.setAttribute('class', 'boat-line');
        
        svg.appendChild(mainLine);
        
        // Add ladder rungs for better visual
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const rungs = Math.max(2, Math.floor(distance / 12)); // Fewer but more visible rungs
        
        for (let i = 1; i <= rungs; i++) {
            const ratio = i / (rungs + 1);
            const rungX = startX + (endX - startX) * ratio;
            const rungY = startY + (endY - startY) * ratio;
            
            // Create perpendicular rung
            const rung = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const angle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2;
            const rungLength = 4; // Longer rungs
            
            rung.setAttribute('x1', rungX - Math.cos(angle) * rungLength);
            rung.setAttribute('y1', rungY - Math.sin(angle) * rungLength);
            rung.setAttribute('x2', rungX + Math.cos(angle) * rungLength);
            rung.setAttribute('y2', rungY + Math.sin(angle) * rungLength);
            rung.setAttribute('class', 'boat-rung');
            
            svg.appendChild(rung);
        }
        
        // Add boat markers with better emojis
        const boatBottom = document.createElement('div');
        boatBottom.className = shouldAnimate ? 'boat-bottom' : 'boat-bottom no-animation';
        boatBottom.style.left = `${startX}%`;
        boatBottom.style.top = `${startY}%`;
        boatBottom.innerHTML = '🚢'; // Ship at bottom
        
        const boatTop = document.createElement('div');
        boatTop.className = shouldAnimate ? 'boat-top' : 'boat-top no-animation';
        boatTop.style.left = `${endX}%`;
        boatTop.style.top = `${endY}%`;
        boatTop.innerHTML = '⛵'; // Sailboat at top
        
        boatContainer.appendChild(svg);
        boatContainer.appendChild(boatBottom);
        boatContainer.appendChild(boatTop);
        
        // Add tooltip with clear explanation
        boatContainer.title = `Boat Ladder! From square ${bottom} up to ${top}`;
        
        board.appendChild(boatContainer);
    }

    createPlayerPieces() {
        // Create game pieces for both players
        Object.keys(this.players).forEach(playerId => {
            const piece = document.createElement('div');
            piece.className = `game-piece player${playerId}`;
            piece.id = `piece-player${playerId}`;
            this.players[playerId].piece = piece;
            document.getElementById('game-board').appendChild(piece);
        });

        this.updatePlayerPositions();
    }

    updatePlayerPositions() {
        // Batch DOM updates for better mobile performance
        this.batchDOMUpdates(() => {
            const board = document.getElementById('game-board');
            
            Object.keys(this.players).forEach(playerId => {
                const player = this.players[playerId];
                const targetSquare = document.getElementById(`square-${player.position}`);
                const piece = player.piece;

                if (targetSquare && piece) {
                    // Use CSS Grid positioning for more accurate placement
                    const squareRect = targetSquare.getBoundingClientRect();
                    const boardRect = board.getBoundingClientRect();
                    
                    // Get square dimensions for proper centering
                    const squareWidth = squareRect.width;
                    const squareHeight = squareRect.height;
                    
                    // Calculate center position relative to board
                    const centerX = squareRect.left - boardRect.left + squareWidth / 2;
                    const centerY = squareRect.top - boardRect.top + squareHeight / 2;
                    
                    // Player offset to prevent overlap - scale with square size
                    const offsetScale = Math.min(squareWidth, squareHeight) / 60; // Responsive offset
                    const offsetX = playerId === '1' ? -4 * offsetScale : 4 * offsetScale;
                    const offsetY = playerId === '1' ? -4 * offsetScale : 4 * offsetScale;

                    // Adaptive piece size for mobile
                    const pieceRadius = window.innerWidth <= 768 ? 11 : 12; // 22px/2 on mobile, 24px/2 on desktop
                    
                    // Final position accounting for piece size
                    const finalX = centerX - pieceRadius + offsetX;
                    const finalY = centerY - pieceRadius + offsetY;

                    // Set position using both methods for maximum compatibility
                    piece.style.left = `${finalX}px`;
                    piece.style.top = `${finalY}px`;
                    piece.style.transform = `translate(0, 0)`; // Reset transform
                }
            });
        });
    }

    refreshFishBoatAnimations() {
        // Remove existing fish/boat visuals
        const board = document.getElementById('game-board');
        const fishContainers = board.querySelectorAll('.fish-container');
        const boatContainers = board.querySelectorAll('.boat-container');
        
        fishContainers.forEach(container => container.remove());
        boatContainers.forEach(container => container.remove());
        
        // Recreate with updated animations
        this.createFishAndBoatVisuals();
    }

    setupEventListeners() {
        // Desktop dice roll events
        document.getElementById('dice').addEventListener('click', () => this.rollDice());
        document.getElementById('roll-button').addEventListener('click', () => this.rollDice());
        
        // Mobile dice roll events
        document.getElementById('mobile-dice').addEventListener('click', () => this.rollDice());
        document.getElementById('mobile-roll-button').addEventListener('click', () => this.rollDice());
        
        // Desktop game control events
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('clear-stats').addEventListener('click', () => this.clearStats());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistoryModal());
        
        // Mobile menu events
        document.getElementById('mobile-menu-button').addEventListener('click', () => this.showMobileMenu());
        document.getElementById('mobile-menu-close').addEventListener('click', () => this.hideMobileMenu());
        document.getElementById('mobile-menu-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'mobile-menu-overlay') {
                this.hideMobileMenu();
            }
        });
        
        // Mobile menu items
        document.getElementById('mobile-new-game').addEventListener('click', () => {
            this.hideMobileMenu();
            this.newGame();
        });
        document.getElementById('mobile-history-btn').addEventListener('click', () => {
            this.hideMobileMenu();
            this.showHistoryModal();
        });
        document.getElementById('mobile-clear-stats').addEventListener('click', () => {
            this.hideMobileMenu();
            this.clearStats();
        });
        
        // History modal events
        document.getElementById('close-history').addEventListener('click', () => this.hideHistoryModal());
        document.getElementById('current-game-tab').addEventListener('click', () => this.showHistoryTab('current-game'));
        document.getElementById('overall-stats-tab').addEventListener('click', () => this.showHistoryTab('overall-stats'));
        
        // Close modal when clicking outside
        document.getElementById('history-modal').addEventListener('click', (e) => {
            if (e.target.id === 'history-modal') {
                this.hideHistoryModal();
            }
        });

        // Handle window resize with throttled repositioning for performance
        const throttledResize = FishBoatLaddersGame.throttle(() => {
            this.updatePlayerPositions();
        }, 100);
        window.addEventListener('resize', throttledResize, { passive: true });
        
        // Mobile-specific orientation change handling
        if ('orientation' in screen) {
            window.addEventListener('orientationchange', () => {
                // Delay to allow layout to settle after orientation change
                setTimeout(() => {
                    this.updatePlayerPositions();
                }, 200);
            }, { passive: true });
        }

        // Set up Intersection Observer for performance optimization
        this.setupIntersectionObserver();
    }

    /**
     * Roll dice with modern async patterns
     * @returns {Promise<number>} The dice roll result
     */
    async rollDice() {
        if (this.isRolling || this.isGameOver) return;

        this.isRolling = true;
        
        // Play dice rolling sound
        this.playDiceRollSound();
        const dice = document.getElementById('dice');
        const rollButton = document.getElementById('roll-button');
        const diceValue = document.getElementById('dice-value');
        
        // Mobile elements
        const mobileDice = document.getElementById('mobile-dice');
        const mobileRollButton = document.getElementById('mobile-roll-button');
        const mobileDiceValue = document.getElementById('mobile-dice-value');

        // Disable controls during roll
        dice.classList.add('rolling');
        mobileDice.classList.add('rolling');
        rollButton.disabled = true;
        mobileRollButton.disabled = true;
        diceValue.textContent = 'Rolling...';
        mobileDiceValue.textContent = 'Rolling...';

        // Simulate dice roll with modern Promise-based animation
        try {
            const roll = await this.animateDiceRoll();
            const diceEmoji = this.getDiceEmoji(roll);
            
            dice.classList.remove('rolling');
            mobileDice.classList.remove('rolling');
            dice.textContent = diceEmoji;
            mobileDice.textContent = diceEmoji;
            diceValue.textContent = `Rolled: ${roll}`;
            mobileDiceValue.textContent = `Rolled: ${roll}`;

            // Check if player gets another turn (rolled the extra turn number)
            this.canRollAgain = (roll === FishBoatLaddersGame.EXTRA_TURN_ROLL);

            // Move the player
            await this.movePlayer(roll);

            return roll;
        } catch (error) {
            console.error('Error during dice roll:', error);
            this.updateGameStatus('❌ Error rolling dice. Please try again.');
        } finally {
            // Re-enable controls
            rollButton.disabled = false;
            mobileRollButton.disabled = false;
            this.isRolling = false;
        }
    }

    /**
     * Animate dice roll with Promise-based timing
     * @returns {Promise<number>} The rolled value
     */
    animateDiceRoll() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const roll = Math.floor(Math.random() * 6) + 1;
                resolve(roll);
            }, 1000);
        });
    }

    getDiceEmoji(value) {
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return diceEmojis[value - 1];
    }

    /**
     * Move player with modern async/await pattern
     * @param {number} steps - Number of steps to move
     * @returns {Promise<void>}
     */
    async movePlayer(steps) {
        const player = this.players[this.currentPlayer];
        const oldPosition = player.position;
        const newPosition = player.position + steps;

        // Record the move
        this.recordMove(this.currentPlayer, steps, oldPosition, newPosition);

        // Check if player would exceed winning square
        if (newPosition > FishBoatLaddersGame.WINNING_SQUARE) {
            const needed = FishBoatLaddersGame.WINNING_SQUARE - player.position;
            this.updateGameStatus(`🎯 Player ${this.currentPlayer} needs exactly ${needed} to win!`);
            if (!this.canRollAgain) {
                this.switchPlayer();
            }
            return;
        }

        // Animate piece movement with Promise
        await this.animatePlayerMovement(player, newPosition);

        // Check for win condition
        if (newPosition === FishBoatLaddersGame.WINNING_SQUARE) {
            this.handleGameWin();
            return;
        }

        // Check for fish or boat
        await this.checkSpecialSquares(newPosition);
    }

    /**
     * Animate player movement with Promise-based timing - optimized for mobile
     * @param {Object} player - Player object
     * @param {number} newPosition - Target position
     * @returns {Promise<void>}
     */
    animatePlayerMovement(player, newPosition) {
        return new Promise((resolve) => {
            player.piece.classList.add('moving');
            
            // Use requestAnimationFrame for smooth animation
            this.scheduleAnimation(() => {
                // Adaptive animation timing based on device capabilities
                let animationTime = 300; // Default
                
                if (this.isLowEndDevice) {
                    animationTime = 150; // Very fast for low-end devices
                } else if (this.isWebView) {
                    animationTime = 200; // Fast for webviews
                } else if (window.innerWidth <= 768) {
                    animationTime = 250; // Mobile optimization
                }
                
                setTimeout(() => {
                    player.position = newPosition;
                    // Batch all updates together
                    this.batchDOMUpdates(() => {
                        this.updatePlayerPositions();
                        this.updateDisplay();
                        this.refreshFishBoatAnimations();
                        player.piece.classList.remove('moving');
                    });
                    resolve();
                }, animationTime);
            });
        });
    }

    /**
     * Check and handle special squares (fish/boats) with modern async patterns
     * @param {number} position - Current position to check
     * @returns {Promise<void>}
     */
    async checkSpecialSquares(position) {
        const player = this.players[this.currentPlayer];

        // Check if landed on fish (like snake head)
        if (this.fishPositions[position]) {
            const fishTail = this.fishPositions[position];
            this.updateGameStatus(`🦈 Oh no! Player ${this.currentPlayer} got caught by a shark! Dragged down to square ${fishTail}!`);
            
            // Show detailed notification
            const moveDown = position - fishTail;
            this.showNotification(`
                🦈 <strong>SHARK ATTACK!</strong><br/>
                Player ${this.currentPlayer} landed on square ${position}<br/>
                The hungry shark drags them down ${moveDown} squares to ${fishTail}!<br/>
                🌊 Better luck next time!
            `, 4000);

            // Play fish bite sound
            this.playFishBiteSound();

            // Animate fish movement
            setTimeout(() => {
                player.piece.classList.add('moving');
                setTimeout(() => {
                    player.position = fishTail;
                    // Record the special move
                    this.gameHistory[this.gameHistory.length - 1].special = {
                        type: 'shark',
                        newPosition: fishTail
                    };
                    this.updatePlayerPositions();
                    this.updateDisplay();
                    player.piece.classList.remove('moving');

                    // Continue turn logic
                    this.endTurn();
                    this.saveGameState();
                }, 600);
            }, 1000);

        // Check if landed on boat (like ladder bottom)
        } else if (this.boatPositions[position]) {
            const boatTop = this.boatPositions[position];
            this.updateGameStatus(`⛵ Great! Player ${this.currentPlayer} found a boat ladder! Sailing up to square ${boatTop}!`);
            
            // Show detailed notification
            const moveUp = boatTop - position;
            this.showNotification(`
                ⛵ <strong>BOAT RESCUE!</strong><br/>
                Player ${this.currentPlayer} found a boat ladder on square ${position}<br/>
                The friendly boat lifts them up ${moveUp} squares to ${boatTop}!<br/>
                🌟 What a lucky break!
            `, 4000);

            // Play boat rescue sound
            this.playBoatRescueSound();

            // Animate boat movement
            setTimeout(() => {
                player.piece.classList.add('moving');
                setTimeout(() => {
                    player.position = boatTop;
                    // Record the special move
                    this.gameHistory[this.gameHistory.length - 1].special = {
                        type: 'boat',
                        newPosition: boatTop
                    };
                    this.updatePlayerPositions();
                    this.updateDisplay();
                    player.piece.classList.remove('moving');

                    // Check if boat took player to winning square
                    if (boatTop === FishBoatLaddersGame.WINNING_SQUARE) {
                        this.handleGameWin();
                        return;
                    }

                    // Continue turn logic
                    this.endTurn();
                    this.saveGameState();
                }, 600);
            }, 1000);

        } else {
            // No special square, just end turn
            this.endTurn();
            this.saveGameState();
        }
    }

    endTurn() {
        if (!this.canRollAgain) {
            this.switchPlayer();
        } else {
            this.updateGameStatus(`🎲 Player ${this.currentPlayer} rolled a ${FishBoatLaddersGame.EXTRA_TURN_ROLL}! Roll again!`);
            this.canRollAgain = false;
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.canRollAgain = false;
        this.updateDisplay();
        this.updateGameStatus(`🎮 Player ${this.currentPlayer}'s turn to roll!`);
        this.saveGameState();
    }

    handleGameWin() {
        this.isGameOver = true;
        
        // Play victory sound
        this.playWinSound();
        
        // Update statistics
        this.stats[`player${this.currentPlayer}Wins`]++;
        this.stats.totalGames++;
        this.saveGameStats();

        // Update display
        this.updateDisplay();
        
        // Show winner message
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = `🎉 ${this.players[this.currentPlayer].name} WINS! 🏆 Congratulations!`;
        statusElement.classList.add('winner');
        
        // Save final game state
        this.saveGameState();
    }

    updateDisplay() {
        // Update player cards
        Object.keys(this.players).forEach(playerId => {
            const playerCard = document.getElementById(`player${playerId}`);
            const isActivePlayer = (parseInt(playerId) === this.currentPlayer && !this.isGameOver);
            
            playerCard.classList.toggle('active', isActivePlayer);
            
            // Update position display
            const positionElement = playerCard.querySelector('.position');
            positionElement.textContent = `Square: ${this.players[playerId].position}`;
        });

        // Update win statistics
        document.getElementById('p1-wins').textContent = this.stats.player1Wins;
        document.getElementById('p2-wins').textContent = this.stats.player2Wins;

        // Update turn indicator
        if (!this.isGameOver) {
            const turnText = `${this.players[this.currentPlayer].name}'s Turn`;
            document.getElementById('current-turn').textContent = turnText;
            document.getElementById('mobile-current-turn').textContent = turnText;
        } else {
            document.getElementById('current-turn').textContent = `Game Over!`;
            document.getElementById('mobile-current-turn').textContent = `Game Over!`;
        }
    }

    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }

    showNotification(message, duration = 3000) {
        const notificationArea = document.getElementById('notification-area');
        const notificationContent = document.getElementById('notification-content');
        
        notificationContent.innerHTML = message;
        notificationArea.style.display = 'block';
        
        // Auto-hide after duration
        setTimeout(() => {
            notificationArea.style.display = 'none';
        }, duration);
    }

    newGame() {
        // Show confirmation if game is in progress
        if (!this.isGameOver && (this.players[1].position > 1 || this.players[2].position > 1 || this.gameHistory.length > 0)) {
            this.showConfirmDialog(
                '🎮 New Game Confirmation',
                'A game is currently in progress. Are you sure you want to start a new game? All progress will be lost.',
                (confirmed) => {
                    if (confirmed) {
                        this.resetGame();
                    }
                }
            );
            return;
        }

        this.resetGame();
    }

    resetGame() {
        // Reset game state
        this.currentPlayer = 1;
        this.players[1].position = FishBoatLaddersGame.STARTING_SQUARE;
        this.players[2].position = FishBoatLaddersGame.STARTING_SQUARE;
        this.isGameOver = false;
        this.isRolling = false;
        this.canRollAgain = false;
        this.gameHistory = []; // Clear move history

        // Clear saved game state
        this.clearGameState();

        // Reset UI elements
        document.getElementById('game-status').classList.remove('winner');
        document.getElementById('dice').textContent = '🎲';
        document.getElementById('dice-value').textContent = 'Roll Dice';
        document.getElementById('roll-button').disabled = false;
        
        // Reset mobile UI elements
        document.getElementById('mobile-dice').textContent = '🎲';
        document.getElementById('mobile-dice-value').textContent = 'Roll Dice';
        document.getElementById('mobile-roll-button').disabled = false;

        // Update positions and display
        this.updatePlayerPositions();
        this.updateDisplay();
        this.refreshFishBoatAnimations(); // Reset animations for new game
        this.updateGameStatus('🎮 New game started! Player 1, click "ROLL DICE" to begin!');
        
        // Show notification
        this.showNotification(`
            🎮 <strong>NEW GAME STARTED!</strong><br/>
            All progress has been reset.<br/>
            Player 1, you're up first!
        `, 3000);
    }

    clearStats() {
        this.showConfirmDialog(
            '📊 Clear Statistics',
            'Are you sure you want to clear all game statistics? This action cannot be undone and will reset all win records.',
            (confirmed) => {
                if (confirmed) {
                    this.stats = {
                        player1Wins: 0,
                        player2Wins: 0,
                        totalGames: 0
                    };
                    this.saveGameStats();
                    this.updateDisplay();
                    this.updateGameStatus('📊 Game statistics cleared! All win records have been reset.');
                    
                    // Show notification
                    this.showNotification(`
                        📊 <strong>STATISTICS CLEARED!</strong><br/>
                        All game statistics have been reset.<br/>
                        Win counts are now back to zero.
                    `, 3000);
                }
            }
        );
    }

    /**
     * Loads game statistics from localStorage
     * @returns {Object} Statistics object with player wins and total games
     */
    loadGameStats() {
        try {
            const saved = localStorage.getItem('fishBoatGameStats');
            if (saved) {
                const stats = JSON.parse(saved);
                // Validate loaded data structure
                if (typeof stats === 'object' && 
                    typeof stats.player1Wins === 'number' &&
                    typeof stats.player2Wins === 'number' &&
                    typeof stats.totalGames === 'number') {
                    return stats;
                }
            }
        } catch (error) {
            console.error('Error loading game stats:', error);
        }
        
        // Return default stats if loading fails or data is invalid
        return {
            player1Wins: 0,
            player2Wins: 0,
            totalGames: 0
        };
    }

    /**
     * Saves game statistics to localStorage with modern error handling
     * @returns {Promise<boolean>} Success status
     */
    async saveGameStats() {
        try {
            const statsData = JSON.stringify(this.stats);
            localStorage.setItem('fishBoatGameStats', statsData);
            return true;
        } catch (error) {
            console.error('Error saving game stats:', error);
            this.handleStorageError('Failed to save game statistics');
            return false;
        }
    }

    /**
     * Handle storage errors with user-friendly messages
     * @param {string} message - Error message
     */
    handleStorageError(message) {
        this.showNotification(`
            ⚠️ <strong>Storage Error</strong><br/>
            ${message}<br/>
            Your progress may not be saved.
        `, 4000);
    }

    /**
     * Modern utility to safely access nested object properties
     * @param {Object} obj - Object to access
     * @param {string} path - Dot notation path
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Value at path or default
     */
    static safeGet(obj, path, defaultValue = null) {
        return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    }

    /**
     * Modern throttle utility for performance optimization
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Modern error boundary for handling unexpected errors
     * @param {Error} error - The error that occurred
     * @param {string} context - Context where error occurred
     */
    handleGameError(error, context = 'Unknown') {
        console.error(`Game Error in ${context}:`, error);
        
        // Show user-friendly error message
        this.showNotification(`
            🔧 <strong>Oops! Something went wrong</strong><br/>
            ${context}: ${error.message}<br/>
            The game will continue to work normally.
        `, 5000);

        // Could send error to analytics service here
        // this.sendErrorAnalytics(error, context);
    }

    /**
     * Validate game state integrity
     * @returns {boolean} True if game state is valid
     */
    validateGameState() {
        try {
            // Check player positions are valid
            const validPositions = Object.values(this.players).every(player => 
                player.position >= FishBoatLaddersGame.STARTING_SQUARE && 
                player.position <= FishBoatLaddersGame.WINNING_SQUARE
            );

            // Check current player is valid
            const validCurrentPlayer = [1, 2].includes(this.currentPlayer);

            return validPositions && validCurrentPlayer;
        } catch (error) {
            this.handleGameError(error, 'Game State Validation');
            return false;
        }
    }

    /**
     * Records a player move in the game history
     * @param {number} player - Player number (1 or 2)
     * @param {number} diceRoll - The dice roll value
     * @param {number} fromSquare - Starting square
     * @param {number} toSquare - Ending square
     * @param {Object|null} specialAction - Special action details (fish/boat)
     */
    recordMove(player, diceRoll, fromSquare, toSquare, specialAction = null) {
        const now = new Date();
        const move = {
            player: player,
            playerName: this.players[player]?.name || `Player ${player}`, // Store current player name with fallback
            roll: diceRoll,
            from: fromSquare,
            to: toSquare,
            special: specialAction,
            timestamp: now.toLocaleTimeString('en-US', { hour12: true }),
            fullTimestamp: now.toLocaleString('en-US', { hour12: true })
        };
        this.gameHistory.push(move);
    }

    showHistoryModal() {
        this.updateHistoryDisplay();
        this.updateStatsDisplay();
        document.getElementById('history-modal').style.display = 'flex';
    }

    hideHistoryModal() {
        document.getElementById('history-modal').style.display = 'none';
    }

    showHistoryTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(`${tabName}-content`).style.display = 'block';
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('move-history');
        
        if (this.gameHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-moves">No moves yet. Start playing!</p>';
            return;
        }

        let historyHTML = '';
        // Show latest moves first by reversing the array
        const reversedHistory = [...this.gameHistory].reverse();
        
        reversedHistory.forEach((move) => {
            const isSpecial = move.special !== null;
            const specialClass = isSpecial ? ' special' : '';
            
            let actionText = `Rolled ${move.roll}, moved from ${move.from} to ${move.to}`;
            let resultText = '';
            
            if (move.special) {
                if (move.special.type === 'shark') {
                    actionText = `Rolled ${move.roll}, landed on shark at ${move.to}`;
                    resultText = `🦈 Dragged down to ${move.special.newPosition}`;
                } else if (move.special.type === 'boat') {
                    actionText = `Rolled ${move.roll}, found boat at ${move.to}`;
                    resultText = `⛵ Sailed up to ${move.special.newPosition}`;
                }
            }

            // Use current player name, fallback to stored name or default
            const playerName = this.players[move.player]?.name || move.playerName || `Player ${move.player}`;
            
            historyHTML += `
                <div class="move-item${specialClass}">
                    <div class="move-details">
                        <div class="move-player">${playerName} - ${move.timestamp}</div>
                        <div class="move-action">${actionText}</div>
                        ${resultText ? `<div class="move-result">${resultText}</div>` : ''}
                    </div>
                </div>
            `;
        });

        historyContainer.innerHTML = historyHTML;
    }

    updateStatsDisplay() {
        document.getElementById('total-games').textContent = this.stats.totalGames;
        document.getElementById('p1-total-wins').textContent = this.stats.player1Wins;
        document.getElementById('p2-total-wins').textContent = this.stats.player2Wins;
    }

    saveGameState() {
        const gameState = {
            currentPlayer: this.currentPlayer,
            players: {
                1: { position: this.players[1].position, name: this.players[1].name },
                2: { position: this.players[2].position, name: this.players[2].name }
            },
            isGameOver: this.isGameOver,
            canRollAgain: this.canRollAgain,
            gameHistory: this.gameHistory
        };

        try {
            localStorage.setItem('fishBoatGameState', JSON.stringify(gameState));
        } catch (e) {
            console.error('Error saving game state:', e);
        }
    }

    loadGameState() {
        const saved = localStorage.getItem('fishBoatGameState');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                this.currentPlayer = gameState.currentPlayer;
                this.players[1].position = gameState.players[1].position;
                this.players[2].position = gameState.players[2].position;
                this.players[1].name = gameState.players[1].name || 'Player 1';
                this.players[2].name = gameState.players[2].name || 'Player 2';
                this.isGameOver = gameState.isGameOver || false;
                this.canRollAgain = gameState.canRollAgain || false;
                this.gameHistory = gameState.gameHistory || [];
                
                // Update player name displays
                document.getElementById('player1-name').textContent = this.players[1].name;
                document.getElementById('player2-name').textContent = this.players[2].name;
                
                // If there's a saved game, show a restore message
                if (gameState.players[1].position > 1 || gameState.players[2].position > 1 || gameState.gameHistory.length > 0) {
                    setTimeout(() => {
                        this.showNotification(`
                            🎮 <strong>GAME RESTORED!</strong><br/>
                            Your previous game has been loaded.<br/>
                            Player ${this.currentPlayer} is up next. Continue playing or start a new game.
                        `, 5000);
                    }, 500);
                }
            } catch (e) {
                console.error('Error loading game state:', e);
            }
        }
    }

    clearGameState() {
        try {
            localStorage.removeItem('fishBoatGameState');
        } catch (e) {
            console.error('Error clearing game state:', e);
        }
    }

    editPlayerName(playerNumber) {
        const currentName = this.players[playerNumber].name;
        this.showInputDialog(
            '✏️ Edit Player Name',
            `Enter a new name for ${currentName}:`,
            currentName,
            (newName) => {
                if (newName && newName !== currentName) {
                    this.players[playerNumber].name = newName;
                    document.getElementById(`player${playerNumber}-name`).textContent = newName;
                    
                    // Update turn indicator if it's showing this player
                    if (this.currentPlayer === playerNumber) {
                        document.getElementById('current-turn').textContent = `${this.players[playerNumber].name}'s Turn`;
                    }
                    
                    // Save the updated state
                    this.saveGameState();
                    
                    // Show notification
                    this.showNotification(`
                        ✏️ <strong>NAME UPDATED!</strong><br/>
                        Player ${playerNumber} is now called "${newName}"
                    `, 2000);
                }
            }
        );
    }

    initializeAudio() {
        // Simple audio context for sound effects using Web Audio API
        this.audioContext = null;
        try {
            // Use proper AudioContext with fallback for webkit browsers
            const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        } catch (error) {
            console.log('Web Audio API not supported:', error);
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }

    playFishBiteSound() {
        // Play a sequence of descending notes for fish bite
        this.playSound(400, 0.2, 'sawtooth');
        setTimeout(() => this.playSound(300, 0.2, 'sawtooth'), 150);
        setTimeout(() => this.playSound(200, 0.3, 'sawtooth'), 300);
    }

    playBoatRescueSound() {
        // Play ascending notes for boat rescue (joyful)
        this.playSound(300, 0.2, 'sine');
        setTimeout(() => this.playSound(400, 0.2, 'sine'), 150);
        setTimeout(() => this.playSound(500, 0.2, 'sine'), 300);
        setTimeout(() => this.playSound(600, 0.3, 'sine'), 450);
    }

    playWinSound() {
        // Play a victory fanfare
        const notes = [523, 587, 659, 698, 784, 880]; // C, D, E, F, G, A
        notes.forEach((note, noteIndex) => {
            setTimeout(() => {
                this.playSound(note, 0.4, 'triangle');
            }, noteIndex * 200);
        });
    }

    playDiceRollSound() {
        // Play rolling dice sound - multiple quick clicks
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playSound(150 + Math.random() * 100, 0.05, 'square');
            }, i * 80);
        }
    }

    // Custom modal functions
    showConfirmDialog(title, message, callback) {
        const modal = document.getElementById('confirmation-modal');
        const titleEl = document.getElementById('confirmation-title');
        const messageEl = document.getElementById('confirmation-message');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');

        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.style.display = 'flex';

        // Remove any existing event listeners
        const newYesBtn = yesBtn.cloneNode(true);
        const newNoBtn = noBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
        noBtn.parentNode.replaceChild(newNoBtn, noBtn);

        // Add new event listeners
        newYesBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            callback(true);
        });

        newNoBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            callback(false);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                callback(false);
            }
        });
    }

    showInputDialog(title, message, defaultValue, callback) {
        const modal = document.getElementById('input-modal');
        const titleEl = document.getElementById('input-title');
        const messageEl = document.getElementById('input-message');
        const inputEl = document.getElementById('input-field');
        const okBtn = document.getElementById('input-ok');
        const cancelBtn = document.getElementById('input-cancel');

        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.value = defaultValue || '';
        modal.style.display = 'flex';
        
        // Focus the input field
        setTimeout(() => inputEl.focus(), 100);

        // Remove any existing event listeners
        const newOkBtn = okBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        const handleOk = () => {
            modal.style.display = 'none';
            callback(inputEl.value.trim());
        };

        const handleCancel = () => {
            modal.style.display = 'none';
            callback(null);
        };

        // Add new event listeners
        newOkBtn.addEventListener('click', handleOk);
        newCancelBtn.addEventListener('click', handleCancel);

        // Handle Enter key
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleOk();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });
    }

    showMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-button');
        const menuOverlay = document.getElementById('mobile-menu-overlay');
        
        menuButton.classList.add('active');
        menuOverlay.style.display = 'block';
    }

    hideMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-button');
        const menuOverlay = document.getElementById('mobile-menu-overlay');
        
        menuButton.classList.remove('active');
        menuOverlay.style.display = 'none';
    }
}

// Global game instance for onclick handlers
let game;

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new FishBoatLaddersGame();
});