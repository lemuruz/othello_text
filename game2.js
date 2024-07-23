const prompt = require('prompt-sync')();
let gameIsRunning = true;

class BOARD {
    constructor() {
        this.board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "🟩"));
        this.player1 = new PLAYER('⚪');
        this.player2 = new PLAYER('⚫');
        this.currentPlayer = this.player1;
        this.board[3][3] = this.player1.playerToken;
        this.board[3][4] = this.player2.playerToken;
        this.board[4][3] = this.player2.playerToken;
        this.board[4][4] = this.player1.playerToken;
        
        this.playGame();
    }

    printBoard() {
        console.clear()
        this.checkBoard();
        console.log("  a b c d e f g h");
        console.log("  ================");
        for (let i = 0; i < 8; i++) {
            let row = "";
            for (let j = 0; j < 8; j++) {
                row += this.board[i][j] + "";
            }
            console.log(i + '|' + row.trim());
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    }

    isValidMove(coordinates) {
        if (!coordinates) {
            return false;
        }

        let col = coordinates[1].charCodeAt(0) - 'a'.charCodeAt(0);
        if (this.board[coordinates[0]][col] === '⭕') {
            this.placePiece(parseInt(coordinates[0]), col);
            return true;
        } else {
            console.log('This coordinate is invalid, please select "⭕"');
            return false;
        }
    }

    placePiece(x, y) {
        let board = this.board;
        let opposite = this.currentPlayer === this.player1 ? this.player2.playerToken : this.player1.playerToken;
        let currentPlayer = this.currentPlayer.playerToken;
        let checkDirection = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];

        for (let direction of checkDirection) {
            let [dix, diy] = direction;
            this.flipDirection(x, y, dix, diy, opposite, currentPlayer);
        }
        this.board[x][y] = currentPlayer;
    }

    flipDirection(current_x, current_y, direction_x, direction_y, opposite, currentToken) {
        let board = this.board;
        let positions_to_flip = [];
        let checking_x = current_x + direction_x;
        let checking_y = current_y + direction_y;

        while (checking_x >= 0 && checking_x < 8 && checking_y >= 0 && checking_y < 8) {
            if (board[checking_x][checking_y] === '🟩' || board[checking_x][checking_y] === '⭕') {
                break;
            } else if (board[checking_x][checking_y] === opposite) {
                positions_to_flip.push([checking_x, checking_y]);
            } else if (board[checking_x][checking_y] === currentToken) {
                for (let pos of positions_to_flip) {
                    board[pos[0]][pos[1]] = currentToken;
                }
                return;
            }
            checking_x += direction_x;
            checking_y += direction_y;
        }
    }

    checkBoard() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === '⭕') {
                    this.board[i][j] = '🟩';
                }
            }
        }
        let hasEmptySpace = false;
        let checkDirection = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        let opposite = this.currentPlayer === this.player1 ? this.player2.playerToken : this.player1.playerToken;
        let currentPlayer = this.currentPlayer.playerToken;

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === '🟩') {
                    let valid = false;
                    for (let direction of checkDirection) {
                        let [dix, diy] = direction;
                        if (this.checkIfThatDirectionValid(i, j, dix, diy, opposite, currentPlayer)) {
                            valid = true;
                            break;
                        }
                    }
                    if (valid) {
                        hasEmptySpace = true;
                        this.board[i][j] = '⭕';
                    }
                }
            }
        }
        if (!hasEmptySpace) {
            this.gameOver();
        }
    }

    checkIfThatDirectionValid(current_x, current_y, direction_x, direction_y, opposite, currentToken) {
        let board = this.board;
        let checking_x = current_x + direction_x;
        let checking_y = current_y + direction_y;
        let opponent_detected = false;

        while (checking_x >= 0 && checking_x < 8 && checking_y >= 0 && checking_y < 8) {
            if (board[checking_x][checking_y] === '🟩' || board[checking_x][checking_y] === '⭕') {
                return false;
            } else if (board[checking_x][checking_y] === opposite) {
                opponent_detected = true;
            } else if (board[checking_x][checking_y] === currentToken && opponent_detected) {
                return true;
            } else {
                return false;
            }
            checking_x += direction_x;
            checking_y += direction_y;
        }
        return false;
    }

    gameOver() {
        let player1Count = 0;
        let player2Count = 0;
        gameIsRunning = false;
        console.clear();
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] = this.player1.playerToken){
                    player1Count +=1;
                }else{
                    player2Count +=1;
                }
            }
        }

        console.log('Game over');
        console.log('player1',this.player1.playerToken);
        console.log('player2',this.player2.playerToken);
        if (player1Count > player2Count){console.log('player1 WIN!')}
        else if (player1Count < player2Count){console.log('player2 WIN!')}
        else{console.log('TIE!')}
    }

    playGame() {
        while (gameIsRunning) {
            this.printBoard();
            let input = this.currentPlayer.playerInput();
            if (this.isValidMove(input)) {
                this.switchPlayer();
            }
        }
    }
}

class PLAYER {
    constructor(token) {
        this.playerToken = token;
    }

    playerInput() {
        if(!gameIsRunning){
            return false;
        }
        console.log('Player', this.playerToken, 'turn');
        let input = prompt('Enter your move (e.g., 0a): ');
        if (input.length === 2 && !isNaN(input[0]) && input[0] >= '0' && input[0] <= '7' && input[1] >= 'a' && input[1] <= 'h') {
            return input;
        } else {
            console.log('Invalid input');
            return this.playerInput();
        }
    }
}

new BOARD();
