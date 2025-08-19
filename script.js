class FishBoatLaddersGame {
    constructor() {
        // Game state
        this.currentPlayer = 1;
        this.players = {
            1: { position: 1, piece: null, name: 'Player 1' },
            2: { position: 1, piece: null, name: 'Player 2' }
        };
        this.isGameOver = false;
        this.isRolling = false;
        this.canRollAgain = false;

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

        // Create fish visuals (like snakes)
        Object.keys(this.fishPositions).forEach(head => {
            const tail = this.fishPositions[head];
            this.createFishPath(parseInt(head), parseInt(tail), board);
        });

        // Create boat visuals (like ladders)
        Object.keys(this.boatPositions).forEach(bottom => {
            const top = this.boatPositions[bottom];
            this.createBoatPath(parseInt(bottom), parseInt(top), board);
        });
    }

    getSquarePosition(squareNumber) {
        const row = Math.floor((squareNumber - 1) / 10);
        const col = (squareNumber - 1) % 10;
        
        // Adjust for zigzag pattern
        const actualCol = row % 2 === 0 ? col : 9 - col;
        const actualRow = 9 - row;
        
        return { row: actualRow, col: actualCol };
    }

    createFishPath(head, tail, board) {
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
        fishHead.className = 'fish-head';
        fishHead.style.left = `${startX}%`;
        fishHead.style.top = `${startY}%`;
        fishHead.innerHTML = '🦈'; // Use shark for head to make it more menacing
        
        // Add fish tail (smaller)
        const fishTail = document.createElement('div');
        fishTail.className = 'fish-tail';
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

    createBoatPath(bottom, top, board) {
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
        boatBottom.className = 'boat-bottom';
        boatBottom.style.left = `${startX}%`;
        boatBottom.style.top = `${startY}%`;
        boatBottom.innerHTML = '🚢'; // Ship at bottom
        
        const boatTop = document.createElement('div');
        boatTop.className = 'boat-top';
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
        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            const targetSquare = document.getElementById(`square-${player.position}`);
            const piece = player.piece;

            if (targetSquare && piece) {
                const squareRect = targetSquare.getBoundingClientRect();
                const boardRect = document.getElementById('game-board').getBoundingClientRect();

                // Calculate piece position with slight offset for each player
                const offsetX = playerId === '1' ? -5 : 5;
                const offsetY = playerId === '1' ? -5 : 5;

                const left = squareRect.left - boardRect.left + squareRect.width / 2 - 10 + offsetX;
                const top = squareRect.top - boardRect.top + squareRect.height / 2 - 10 + offsetY;

                piece.style.left = `${left}px`;
                piece.style.top = `${top}px`;
            }
        });
    }

    setupEventListeners() {
        // Dice roll events
        document.getElementById('dice').addEventListener('click', () => this.rollDice());
        document.getElementById('roll-button').addEventListener('click', () => this.rollDice());
        
        // Game control events
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('clear-stats').addEventListener('click', () => this.clearStats());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistoryModal());
        
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

        // Handle window resize to reposition pieces
        window.addEventListener('resize', () => {
            setTimeout(() => this.updatePlayerPositions(), 100);
        });
    }

    rollDice() {
        if (this.isRolling || this.isGameOver) return;

        this.isRolling = true;
        const dice = document.getElementById('dice');
        const rollButton = document.getElementById('roll-button');
        const diceValue = document.getElementById('dice-value');

        // Disable controls during roll
        dice.classList.add('rolling');
        rollButton.disabled = true;
        diceValue.textContent = 'Rolling...';

        // Simulate dice roll with delay
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            
            dice.classList.remove('rolling');
            dice.textContent = this.getDiceEmoji(roll);
            diceValue.textContent = `Rolled: ${roll}`;

            // Check if player gets another turn (rolled 1)
            this.canRollAgain = (roll === 1);

            // Move the player
            this.movePlayer(roll);

            // Re-enable controls
            setTimeout(() => {
                rollButton.disabled = false;
                this.isRolling = false;
            }, 1000);

        }, 1000);
    }

    getDiceEmoji(value) {
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return diceEmojis[value - 1];
    }

    movePlayer(steps) {
        const player = this.players[this.currentPlayer];
        const oldPosition = player.position;
        const newPosition = player.position + steps;

        // Record the move
        this.recordMove(this.currentPlayer, steps, oldPosition, newPosition);

        // Check if player would exceed 100
        if (newPosition > 100) {
            this.updateGameStatus(`🎯 Player ${this.currentPlayer} needs exactly ${100 - player.position} to win!`);
            if (!this.canRollAgain) {
                this.switchPlayer();
            }
            return;
        }

        // Animate piece movement
        player.piece.classList.add('moving');

        // Update position after animation delay
        setTimeout(() => {
            player.position = newPosition;
            this.updatePlayerPositions();
            this.updateDisplay();
            player.piece.classList.remove('moving');

            // Check for win condition
            if (newPosition === 100) {
                this.handleGameWin();
                return;
            }

            // Check for fish or boat after short delay
            setTimeout(() => {
                this.checkSpecialSquares(newPosition);
            }, 300);

        }, 300);
    }

    checkSpecialSquares(position) {
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

                    // Check if boat took player to 100
                    if (boatTop === 100) {
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
            this.updateGameStatus(`🎲 Player ${this.currentPlayer} rolled a 1! Roll again!`);
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
            document.getElementById('current-turn').textContent = `${this.players[this.currentPlayer].name}'s Turn`;
        } else {
            document.getElementById('current-turn').textContent = `Game Over!`;
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
        this.players[1].position = 1;
        this.players[2].position = 1;
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

        // Update positions and display
        this.updatePlayerPositions();
        this.updateDisplay();
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

    loadGameStats() {
        const saved = localStorage.getItem('fishBoatGameStats');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading game stats:', e);
            }
        }
        return {
            player1Wins: 0,
            player2Wins: 0,
            totalGames: 0
        };
    }

    saveGameStats() {
        try {
            localStorage.setItem('fishBoatGameStats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Error saving game stats:', e);
        }
    }

    recordMove(player, diceRoll, fromSquare, toSquare, specialAction = null) {
        const now = new Date();
        const move = {
            player: player,
            roll: diceRoll,
            from: fromSquare,
            to: toSquare,
            special: specialAction,
            timestamp: now.toLocaleTimeString(),
            fullTimestamp: now.toLocaleString()
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
        
        reversedHistory.forEach((move, index) => {
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

            historyHTML += `
                <div class="move-item${specialClass}">
                    <div class="move-details">
                        <div class="move-player">Player ${move.player} - ${move.timestamp}</div>
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
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
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
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playSound(note, 0.4, 'triangle');
            }, index * 200);
        });
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
}

// Global game instance for onclick handlers
let game;

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new FishBoatLaddersGame();
});