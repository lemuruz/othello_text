const prompt = require('prompt-sync')();
Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

let gameIsRunning = true;

class BOARD {
    constructor(player2) {
        this.board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "🟩"));
        this.player1 = new PLAYER('⚪');
        this.player2 = player2;
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
            this.placeToken(parseInt(coordinates[0]), col);
            return true;
        } else {
            console.log('This coordinate is invalid, please select "⭕"');
            return false;
        }
    }

    placeToken(x, y) {
        let board = this.board;
        let opposite = this.currentPlayer === this.player1 ? this.player2.playerToken : this.player1.playerToken;
        let currentPlayer = this.currentPlayer.playerToken;
        let checkDirection = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];

        for (let direction of checkDirection) {
            let [dix, diy] = direction;
            flipDirection(x, y, dix, diy, opposite, currentPlayer);
        }
        this.board[x][y] = currentPlayer;
    

        function flipDirection(current_x, current_y, direction_x, direction_y, opposite, currentplayerToken) {
            let positions_to_flip = [];
            let checking_x = current_x + direction_x;
            let checking_y = current_y + direction_y;

            while (checking_x >= 0 && checking_x < 8 && checking_y >= 0 && checking_y < 8) {
                if (board[checking_x][checking_y] === '🟩' || board[checking_x][checking_y] === '⭕') {
                    break;
                } else if (board[checking_x][checking_y] === opposite) {
                    positions_to_flip.push([checking_x, checking_y]);
                } else if (board[checking_x][checking_y] === currentplayerToken) {
                    for (let pos of positions_to_flip) {
                        board[pos[0]][pos[1]] = currentplayerToken;
                    }
                    return;
                }
                checking_x += direction_x;
                checking_y += direction_y;
            }
        }
    }
    checkBoard() {
        let board = this.board;
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
                        if (checkIfThatDirectionValid(i, j, dix, diy, opposite, currentPlayer)) {
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
    
        
        function checkIfThatDirectionValid(current_x, current_y, direction_x, direction_y, opposite, currentToken) {
            
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
    }   
    gameOver() {
        let player1Count = 0;
        let player2Count = 0;
        gameIsRunning = false;
        console.clear();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] == this.player1.playerToken) {
                    player1Count += 1;
                } else if (this.board[i][j] == this.player2.playerToken) {
                    player2Count += 1;
                }
            }
        }

        console.log('Game over');
        console.log('Player 1', this.player1.playerToken, 'score:', player1Count);
        console.log('Player 2', this.player2.playerToken, 'score:', player2Count);
        if (player1Count > player2Count) {
            console.log('Player 1 WINS!');
        } else if (player1Count < player2Count) {
            console.log('Player 2 WINS!');
        } else {
            console.log('TIE!');
        }
    }

    async playGame() {
        while (gameIsRunning) {
            this.printBoard();
            let input = null;
            if (this.currentPlayer instanceof PLAYER) {
                input = this.currentPlayer.playerInput();
            } else {
                console.log('Bot turn');
                await delay(1500);
                input = this.currentPlayer.bestMove(this.board);
            }

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
        if (!gameIsRunning) {
            return false;
        }
        console.log('Player', this.playerToken, 'turn');
        let input = prompt('Enter your move (e.g., 0a): ');
        if (input.length === 2 && !isNaN(input[0]) && input[0] >= '0' && input[0] <= '7' && input[1] >= 'a' && input[1] <= 'h') {
            return input;
        } else if (input === 'exit') {
            gameIsRunning = false;
            return false;
        } else {
            console.log('Invalid input');
            return this.playerInput();
        }
    }
}

class BOT {
    constructor(token, difficulty) {
        this.playerToken = token;
        this.difficulty = difficulty;
        this.scoreBoard = [
            [100, -10, 10, 5, 5, 10, -10, 100],
            [-10, -20, 1, 1, 1, 1, -20, -10],
            [10, 1, 3, 3, 3, 3, 1, 10],
            [5, 1, 3, 1, 1, 3, 1, 5],
            [5, 1, 3, 1, 1, 3, 1, 5],
            [10, 1, 3, 3, 3, 3, 1, 10],
            [-10, -20, 1, 1, 1, 1, -20, -10],
            [100, -10, 10, 5, 5, 10, -10, 100]
        ];
    }

    bestMove(board) {
        let placeableCoordinates = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j] === '⭕') {
                    placeableCoordinates.push(i.toString() + String.fromCharCode('a'.charCodeAt(0) + j));
                }
            }
        }

        switch (this.difficulty) {
            case 'lv1':
                return placeableCoordinates.random();
            case 'lv2':
                let highestScoreCoordinates = placeableCoordinates[0];
                for (let i of placeableCoordinates) {
                    if (this.scoreBoard[highestScoreCoordinates[0]][highestScoreCoordinates[1].charCodeAt(0) - 'a'.charCodeAt(0)] <
                        this.scoreBoard[i[0]][i[1].charCodeAt(0) - 'a'.charCodeAt(0)]) {
                        highestScoreCoordinates = i;
                    }
                }
                return highestScoreCoordinates;
        }
    }
}

// onrun
let input_ = null;
while (true) {
    input_ = prompt('choose player2 (player)(bot) : ');

    if (input_ === 'player' || input_ === 'bot') {
        break;
    } else {
        console.clear();
        console.log('invalid input');
    }
}

let difficulty = null;
if (input_ === 'bot') {
    while (true) {
        difficulty = prompt('choose difficulty (lv1)(lv2) : ');
        if (difficulty === 'lv1' || difficulty === 'lv2') {
            break;
        }
        console.clear();
        console.log('invalid input');
    }
}

if (input_ === 'bot') {
    new BOARD(new BOT('⚫', difficulty));
} else {
    new BOARD(new PLAYER('⚫'));
}
