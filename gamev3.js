const prompt = require('prompt-sync')();
Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

class GAME{
    constructor(){
        this.board = new BOARD()
        this.selectMode()
    }
    selectMode(){
        while(true){
            let input = prompt('select game mode player vs player(pvp),player vs bot(pvb) : ')
            if (input == 'pvp'){
                this.board.player2 = new PLAYER('⚫')
                this.play()
                break
            }
            
            
            else if(input == 'pvb'){
                
                while(true){

                    input = prompt('select difficulty (lv1)(lv2) : ')
                    if(input == 'lv1'){
                        this.board.player2 = new BOT('🔵','lv1')
                        break
                    }else if (input == 'lv2'){
                        this.board.player2 = new BOT('🟤','lv2')
                        break
                    }
                    console.clear()
                    console.log('invalid input')
                }
                this.play()
                break
            }else{
                console.clear()
                console.log('invalid input')
            }
        }
        
    }

    async play(){
        
        let playerone_hasmove = true;
        let playertwo_hasmove = true;
        this.board.board[3][3] = this.board.player1.playerPiece;
        this.board.board[3][4] = this.board.player2.playerPiece;
        this.board.board[4][3] = this.board.player2.playerPiece;
        this.board.board[4][4] = this.board.player1.playerPiece;
        let game_is_running = true
        while (game_is_running) {
            //swich player if currentplayer cant place
            let checkThisPlayerValidMove = this.board.hasValidMoves();
            if (checkThisPlayerValidMove == false){
                if (this.board.currentPlayer == this.board.player1){playerone_hasmove = false}
                else if(this.board.currentPlayer == this.board.player2){playertwo_hasmove = false}
                this.board.switchPlayer()
                if (this.board.hasValidMoves() == false){
                    if (this.board.currentPlayer == this.board.player1){playerone_hasmove = false}
                    else if(this.board.currentPlayer == this.board.player2){playertwo_hasmove = false}      
                }
            }else if(checkThisPlayerValidMove == true){
                if (this.board.currentPlayer == this.board.player1){playerone_hasmove = true}
                else if(this.board.currentPlayer == this.board.player2){playertwo_hasmove = true}
            }
            // console.log(playerone_hasmove,playertwo_hasmove);
            this.board.printBoard();
            this.board.calculateScore();
            if (playerone_hasmove == false && playertwo_hasmove == false){
                this.board.gameOver(this.board.board)
                break
            }

            let input = null;
            if (this.board.currentPlayer instanceof PLAYER) {
                input = this.board.currentPlayer.playerInput();
            } else {
                console.log('Bot turn');
                await delay(1500);
                input = this.board.currentPlayer.bestMove(this.board.board);
            }

            if (this.board.isValidMove(input)) {
                this.board.switchPlayer();
            }
            
        }
    }
}

class BOARD{
    constructor(){
        this.board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => "🟩"));
        this.player1 = new PLAYER('⚪');
        this.player2 = null;
        this.currentPlayer = this.player1;
    }
    printBoard(){
        console.clear()
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
        let opposite = this.currentPlayer === this.player1 ? this.player2.playerPiece : this.player1.playerPiece;
        let currentPlayer = this.currentPlayer.playerPiece;
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
    hasValidMoves(){
        let hasValidMoves_ = false
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
        let opposite = this.currentPlayer === this.player1 ? this.player2.playerPiece : this.player1.playerPiece;
        let currentPlayer = this.currentPlayer.playerPiece;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === '🟩') {
                    let valid = false;
                    for (let direction of checkDirection) {
                        let [dix, diy] = direction;
                        if (checkIfThatDirectionValid(i, j, dix, diy, opposite, currentPlayer)) {
                            valid = true;
                            hasValidMoves_ = true
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
        // console.log(hasValidMoves_? true:false)
        return hasValidMoves_? true:false
    
        
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
    calculateScore(){
        let player1_score = 0
        let player2_score = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] == this.player1.playerPiece) {
                    player1_score += 1;
                } else if (this.board[i][j] == this.player2.playerPiece) {
                    player2_score += 1;
                }
            }
        }
        console.log(this.player1.playerPiece,player1_score,this.player2.playerPiece,player2_score)
    }
    gameOver(board){
        let player1_score = 0
        let player2_score = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j] == this.player1.playerPiece) {
                    player1_score += 1;
                } else if (board[i][j] == this.player2.playerPiece) {
                    player2_score += 1;
                }
            }
        }
        this.printBoard()
        console.log('Game over');
        console.log('Player 1', this.player1.playerPiece, 'score:', player1_score);
        console.log('Player 2', this.player2.playerPiece, 'score:', player2_score);
        if (player1_score > player2_score) {
            console.log('Player 1 WINS!');
        } else if (player1_score < player2_score) {
            console.log('Player 2 WINS!');
        } else {
            console.log('TIE!');
        }
        return false
    }
}

class PLAYER {
    constructor(token) {
        this.playerPiece = token;
    }

    playerInput() {

        console.log('Player', this.playerPiece, 'turn');
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

class BOT{
    constructor(piece, difficulty) {
        this.botPiece = piece;
        this.difficult = difficulty;
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
    get playerPiece(){
        return this.botPiece
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

        switch (this.difficult) {
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
new GAME()