class FishBoatLaddersGame {
    constructor() {
        // Game state
        this.currentPlayer = 1;
        this.players = {
            1: { position: 1, piece: null },
            2: { position: 1, piece: null }
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
        
        // Calculate fish path - simplified curved approach
        const fishBody = document.createElement('div');
        fishBody.className = 'fish-body';
        
        // Position fish body to span from head to tail
        const startX = (headPos.col * 100 / 10) + 5; // percentage + offset
        const startY = (headPos.row * 100 / 10) + 5;
        const endX = (tailPos.col * 100 / 10) + 5;
        const endY = (tailPos.row * 100 / 10) + 5;
        
        // Create SVG path for curved fish
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'fish-path');
        svg.setAttribute('viewBox', '0 0 100 100');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Create curved path
        const midX = (startX + endX) / 2;
        const midY = Math.min(startY, endY) - 8; // Curve upward
        
        const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('class', 'fish-line');
        
        svg.appendChild(path);
        
        // Add fish head and tail markers
        const fishHead = document.createElement('div');
        fishHead.className = 'fish-head';
        fishHead.style.left = `${startX}%`;
        fishHead.style.top = `${startY}%`;
        fishHead.textContent = '🐟';
        
        const fishTail = document.createElement('div');
        fishTail.className = 'fish-tail';
        fishTail.style.left = `${endX}%`;
        fishTail.style.top = `${endY}%`;
        fishTail.textContent = '🐟';
        
        fishContainer.appendChild(svg);
        fishContainer.appendChild(fishHead);
        fishContainer.appendChild(fishTail);
        
        // Add tooltip
        fishContainer.title = `Fish! Head at ${head}, tail at ${tail}`;
        
        board.appendChild(fishContainer);
    }

    createBoatPath(bottom, top, board) {
        const bottomPos = this.getSquarePosition(bottom);
        const topPos = this.getSquarePosition(top);
        
        // Create boat container
        const boatContainer = document.createElement('div');
        boatContainer.className = 'boat-container';
        
        // Position boat ladder to span from bottom to top
        const startX = (bottomPos.col * 100 / 10) + 5;
        const startY = (bottomPos.row * 100 / 10) + 5;
        const endX = (topPos.col * 100 / 10) + 5;
        const endY = (topPos.row * 100 / 10) + 5;
        
        // Create SVG for straight ladder-like path
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'boat-path');
        svg.setAttribute('viewBox', '0 0 100 100');
        
        // Main ladder line
        const mainLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        mainLine.setAttribute('x1', startX);
        mainLine.setAttribute('y1', startY);
        mainLine.setAttribute('x2', endX);
        mainLine.setAttribute('y2', endY);
        mainLine.setAttribute('class', 'boat-line');
        
        svg.appendChild(mainLine);
        
        // Add ladder rungs
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const rungs = Math.floor(distance / 8); // One rung every 8 units
        
        for (let i = 1; i < rungs; i++) {
            const ratio = i / rungs;
            const rungX = startX + (endX - startX) * ratio;
            const rungY = startY + (endY - startY) * ratio;
            
            // Create perpendicular rung
            const rung = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const angle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2;
            const rungLength = 3;
            
            rung.setAttribute('x1', rungX - Math.cos(angle) * rungLength);
            rung.setAttribute('y1', rungY - Math.sin(angle) * rungLength);
            rung.setAttribute('x2', rungX + Math.cos(angle) * rungLength);
            rung.setAttribute('y2', rungY + Math.sin(angle) * rungLength);
            rung.setAttribute('class', 'boat-rung');
            
            svg.appendChild(rung);
        }
        
        // Add boat markers
        const boatBottom = document.createElement('div');
        boatBottom.className = 'boat-bottom';
        boatBottom.style.left = `${startX}%`;
        boatBottom.style.top = `${startY}%`;
        boatBottom.textContent = '🚤';
        
        const boatTop = document.createElement('div');
        boatTop.className = 'boat-top';
        boatTop.style.left = `${endX}%`;
        boatTop.style.top = `${endY}%`;
        boatTop.textContent = '⛵';
        
        boatContainer.appendChild(svg);
        boatContainer.appendChild(boatBottom);
        boatContainer.appendChild(boatTop);
        
        // Add tooltip
        boatContainer.title = `Boat! Bottom at ${bottom}, top at ${top}`;
        
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

            // Check if player gets another turn (rolled 6)
            this.canRollAgain = (roll === 6);

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
        const newPosition = player.position + steps;

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
            this.updateGameStatus(`🐟 Player ${this.currentPlayer} caught by a fish! Swimming down to square ${fishTail}!`);

            // Animate fish movement
            setTimeout(() => {
                player.piece.classList.add('moving');
                setTimeout(() => {
                    player.position = fishTail;
                    this.updatePlayerPositions();
                    this.updateDisplay();
                    player.piece.classList.remove('moving');

                    // Continue turn logic
                    this.endTurn();
                }, 600);
            }, 1000);

        // Check if landed on boat (like ladder bottom)
        } else if (this.boatPositions[position]) {
            const boatTop = this.boatPositions[position];
            this.updateGameStatus(`🚤 Player ${this.currentPlayer} found a boat! Sailing up to square ${boatTop}!`);

            // Animate boat movement
            setTimeout(() => {
                player.piece.classList.add('moving');
                setTimeout(() => {
                    player.position = boatTop;
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
                }, 600);
            }, 1000);

        } else {
            // No special square, just end turn
            this.endTurn();
        }
    }

    endTurn() {
        if (!this.canRollAgain) {
            this.switchPlayer();
        } else {
            this.updateGameStatus(`🎲 Player ${this.currentPlayer} rolled a 6! Roll again!`);
            this.canRollAgain = false;
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.canRollAgain = false;
        this.updateDisplay();
        this.updateGameStatus(`🎮 Player ${this.currentPlayer}'s turn to roll!`);
    }

    handleGameWin() {
        this.isGameOver = true;
        
        // Update statistics
        this.stats[`player${this.currentPlayer}Wins`]++;
        this.stats.totalGames++;
        this.saveGameStats();

        // Update display
        this.updateDisplay();
        
        // Show winner message
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = `🎉 Player ${this.currentPlayer} WINS! 🏆 Congratulations!`;
        statusElement.classList.add('winner');
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
            document.getElementById('current-turn').textContent = `Player ${this.currentPlayer}'s Turn`;
        } else {
            document.getElementById('current-turn').textContent = `Game Over!`;
        }
    }

    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }

    newGame() {
        // Reset game state
        this.currentPlayer = 1;
        this.players[1].position = 1;
        this.players[2].position = 1;
        this.isGameOver = false;
        this.isRolling = false;
        this.canRollAgain = false;

        // Reset UI elements
        document.getElementById('game-status').classList.remove('winner');
        document.getElementById('dice').textContent = '🎲';
        document.getElementById('dice-value').textContent = 'Roll Dice';
        document.getElementById('roll-button').disabled = false;

        // Update positions and display
        this.updatePlayerPositions();
        this.updateDisplay();
        this.updateGameStatus('🎮 New game started! Player 1, click "ROLL DICE" to begin!');
    }

    clearStats() {
        this.stats = {
            player1Wins: 0,
            player2Wins: 0,
            totalGames: 0
        };
        this.saveGameStats();
        this.updateDisplay();
        this.updateGameStatus('📊 Game statistics cleared!');
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
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FishBoatLaddersGame();
});