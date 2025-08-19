class FishBoatGame {
    constructor() {
        this.boardSize = 100;
        this.currentPlayer = 1;
        this.players = {
            1: { position: 1, name: 'Player 1', guti: null },
            2: { position: 1, name: 'Player 2', guti: null }
        };
        this.gameOver = false;
        this.isRolling = false;
        this.canRollAgain = false;
        this.gameStats = this.loadGameStats();

        this.fishPositions = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };

        this.boatPositions = {
            2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98
        };

        this.initializeGame();
    }

    loadGameStats() {
        const saved = localStorage.getItem('fishBoatGameStats');
        return saved ? JSON.parse(saved) : { player1Wins: 0, player2Wins: 0, totalGames: 0 };
    }

    saveGameStats() {
        localStorage.setItem('fishBoatGameStats', JSON.stringify(this.gameStats));
    }

    initializeGame() {
        this.createBoard();
        this.drawPaths();
        this.createPlayerGutis();
        this.updatePlayerDisplay();
        this.updateGameStatus('Welcome to Fish & Boat Game! Click "Roll Dice" to start.');
        
        document.getElementById('roll-btn').addEventListener('click', () => this.rollDice());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('clear-stats-btn').addEventListener('click', () => this.clearStats());
    }

    createBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        for (let i = 100; i >= 1; i--) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${i}`;
            
            const squareNumber = document.createElement('div');
            squareNumber.className = 'square-number';
            squareNumber.textContent = i;
            square.appendChild(squareNumber);

            if (this.fishPositions[i]) {
                square.classList.add('fish-start');
                const fishIcon = document.createElement('div');
                fishIcon.className = 'special-icon';
                fishIcon.textContent = '🐟';
                square.appendChild(fishIcon);
            } else if (this.boatPositions[i]) {
                square.classList.add('boat-start');
                const boatIcon = document.createElement('div');
                boatIcon.className = 'special-icon';
                boatIcon.textContent = '⛵';
                square.appendChild(boatIcon);
            }

            Object.values(this.fishPositions).forEach(endPos => {
                if (endPos === i) square.classList.add('fish-end');
            });

            Object.values(this.boatPositions).forEach(endPos => {
                if (endPos === i) square.classList.add('boat-end');
            });

            const row = Math.floor((i - 1) / 10);
            const col = (i - 1) % 10;
            
            if (row % 2 === 0) {
                square.style.order = col;
            } else {
                square.style.order = 9 - col;
            }

            board.appendChild(square);
        }
    }

    drawPaths() {
        const svg = document.getElementById('board-paths');
        svg.innerHTML = '';
        
        const boardRect = document.getElementById('game-board').getBoundingClientRect();
        const squareSize = boardRect.width / 10;
        
        svg.setAttribute('width', boardRect.width + 30);
        svg.setAttribute('height', boardRect.height + 30);
        svg.style.left = '0px';
        svg.style.top = '0px';

        Object.entries(this.fishPositions).forEach(([start, end]) => {
            const startCoords = this.getSquareCoords(parseInt(start), squareSize);
            const endCoords = this.getSquareCoords(parseInt(end), squareSize);
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startCoords.x + 15} ${startCoords.y + 15} Q ${(startCoords.x + endCoords.x) / 2 + 15} ${Math.min(startCoords.y, endCoords.y) - 20 + 15} ${endCoords.x + 15} ${endCoords.y + 15}`;
            path.setAttribute('d', d);
            path.setAttribute('class', 'fish-path');
            svg.appendChild(path);
        });

        Object.entries(this.boatPositions).forEach(([start, end]) => {
            const startCoords = this.getSquareCoords(parseInt(start), squareSize);
            const endCoords = this.getSquareCoords(parseInt(end), squareSize);
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startCoords.x + 15} ${startCoords.y + 15} Q ${(startCoords.x + endCoords.x) / 2 + 15} ${Math.max(startCoords.y, endCoords.y) + 40 + 15} ${endCoords.x + 15} ${endCoords.y + 15}`;
            path.setAttribute('d', d);
            path.setAttribute('class', 'boat-path');
            svg.appendChild(path);
        });
    }

    getSquareCoords(squareNum, squareSize) {
        const row = Math.floor((squareNum - 1) / 10);
        const col = (squareNum - 1) % 10;
        
        let x, y;
        
        if (row % 2 === 0) {
            x = col * squareSize;
        } else {
            x = (9 - col) * squareSize;
        }
        
        y = (9 - row) * squareSize;
        
        return { x, y };
    }

    createPlayerGutis() {
        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            const guti = document.createElement('div');
            guti.className = `board-guti player${playerId}`;
            guti.id = `board-guti-${playerId}`;
            player.guti = guti;
            document.getElementById('game-board').appendChild(guti);
        });
        this.updatePlayerPositions();
    }

    updatePlayerPositions() {
        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            const square = document.getElementById(`square-${player.position}`);
            const guti = player.guti;
            
            if (square && guti) {
                const squareRect = square.getBoundingClientRect();
                const boardRect = document.getElementById('game-board').getBoundingClientRect();
                
                const offsetX = playerId === '1' ? -8 : 8;
                const offsetY = playerId === '1' ? -8 : 8;
                
                guti.style.left = `${squareRect.left - boardRect.left + squareRect.width/2 + offsetX}px`;
                guti.style.top = `${squareRect.top - boardRect.top + squareRect.height/2 + offsetY}px`;
            }
        });
    }

    updatePlayerDisplay() {
        Object.keys(this.players).forEach(playerId => {
            const playerElement = document.getElementById(`player${playerId}`);
            const positionElement = playerElement.querySelector('.player-position');
            positionElement.textContent = `Position: ${this.players[playerId].position}`;
            
            if (parseInt(playerId) === this.currentPlayer && !this.gameOver) {
                playerElement.classList.add('active');
            } else {
                playerElement.classList.remove('active');
            }
        });

        document.getElementById('player1-wins').textContent = this.gameStats.player1Wins;
        document.getElementById('player2-wins').textContent = this.gameStats.player2Wins;

        if (!this.gameOver) {
            document.getElementById('current-turn').textContent = 
                `${this.players[this.currentPlayer].name}'s Turn`;
            
            const indicator = document.getElementById('dice-indicator');
            if (this.canRollAgain) {
                indicator.textContent = 'Roll again! (Got 6)';
                indicator.style.color = '#FF6B6B';
            } else {
                indicator.textContent = 'Roll needed';
                indicator.style.color = '#666';
            }
        }
    }

    rollDice() {
        if (this.isRolling || this.gameOver) return;

        this.isRolling = true;
        const rollBtn = document.getElementById('roll-btn');
        const dice = document.getElementById('dice');
        const diceResult = document.getElementById('dice-result');
        
        rollBtn.disabled = true;
        dice.classList.add('rolling');
        diceResult.textContent = 'Rolling...';

        setTimeout(() => {
            const diceValue = Math.floor(Math.random() * 6) + 1;
            dice.classList.remove('rolling');
            dice.textContent = this.getDiceEmoji(diceValue);
            diceResult.textContent = `Rolled: ${diceValue}`;
            
            this.canRollAgain = diceValue === 6;
            this.movePlayer(diceValue);
            
            setTimeout(() => {
                rollBtn.disabled = false;
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
        let newPosition = player.position + steps;

        if (newPosition > 100) {
            this.updateGameStatus(`${player.name} needs exactly ${100 - player.position} to win!`);
            if (!this.canRollAgain) {
                this.switchPlayer();
            }
            return;
        }

        player.guti.classList.add('moving');
        
        setTimeout(() => {
            player.position = newPosition;
            this.updatePlayerPositions();
            this.updatePlayerDisplay();
            player.guti.classList.remove('moving');

            if (newPosition === 100) {
                this.gameOver = true;
                this.gameStats.totalGames++;
                if (this.currentPlayer === 1) {
                    this.gameStats.player1Wins++;
                } else {
                    this.gameStats.player2Wins++;
                }
                this.saveGameStats();
                this.updatePlayerDisplay();
                this.updateGameStatus(`🎉 ${player.name} WINS! 🎉`);
                document.getElementById('game-status').classList.add('winner');
                return;
            }

            setTimeout(() => {
                this.checkSpecialSquares(newPosition);
            }, 300);
        }, 300);
    }

    checkSpecialSquares(position) {
        const player = this.players[this.currentPlayer];
        
        if (this.fishPositions[position]) {
            const fishEnd = this.fishPositions[position];
            this.updateGameStatus(`${player.name} caught by a fish! Swim back to ${fishEnd} 🐟`);
            
            setTimeout(() => {
                player.guti.classList.add('moving');
                setTimeout(() => {
                    player.position = fishEnd;
                    this.updatePlayerPositions();
                    this.updatePlayerDisplay();
                    player.guti.classList.remove('moving');
                    
                    setTimeout(() => {
                        if (!this.canRollAgain) {
                            this.switchPlayer();
                        } else {
                            this.updateGameStatus(`${player.name} can roll again!`);
                        }
                    }, 500);
                }, 300);
            }, 1000);
        } else if (this.boatPositions[position]) {
            const boatEnd = this.boatPositions[position];
            this.updateGameStatus(`${player.name} found a boat! Sail ahead to ${boatEnd} ⛵`);
            
            setTimeout(() => {
                player.guti.classList.add('moving');
                setTimeout(() => {
                    player.position = boatEnd;
                    this.updatePlayerPositions();
                    this.updatePlayerDisplay();
                    player.guti.classList.remove('moving');
                    
                    setTimeout(() => {
                        if (!this.canRollAgain) {
                            this.switchPlayer();
                        } else {
                            this.updateGameStatus(`${player.name} can roll again!`);
                        }
                    }, 500);
                }, 300);
            }, 1000);
        } else {
            if (!this.canRollAgain) {
                this.switchPlayer();
            } else {
                this.updateGameStatus(`${player.name} can roll again!`);
            }
        }
    }

    switchPlayer() {
        if (this.gameOver) return;
        
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.canRollAgain = false;
        this.updatePlayerDisplay();
        this.updateGameStatus(`${this.players[this.currentPlayer].name}'s turn to roll!`);
    }

    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }

    clearStats() {
        this.gameStats = { player1Wins: 0, player2Wins: 0, totalGames: 0 };
        this.saveGameStats();
        this.updatePlayerDisplay();
        this.updateGameStatus('Game statistics cleared!');
    }

    resetGame() {
        this.currentPlayer = 1;
        this.players[1].position = 1;
        this.players[2].position = 1;
        this.gameOver = false;
        this.isRolling = false;
        this.canRollAgain = false;

        document.getElementById('game-status').classList.remove('winner');
        document.getElementById('roll-btn').disabled = false;
        document.getElementById('dice').textContent = '🎲';
        document.getElementById('dice-result').textContent = 'Roll the dice!';

        this.updatePlayerPositions();
        this.updatePlayerDisplay();
        this.updateGameStatus('New game started! Click "Roll Dice" to begin.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FishBoatGame();
});