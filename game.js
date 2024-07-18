const prompt = require('prompt-sync')();

class Game_menu {
    constructor() {
        let on_lunch_text = `Othello text base
type 'exit while in game to exit the game'
type 'start' to start the game`;
        console.log(on_lunch_text);

        const readline = require('readline');
        const ask = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        ask.question('type: ', (type) => {
            if (type.toLowerCase() == 'start') {
                this.game_on = new Game_table();
            } else if (type.toLowerCase() == 'help') {
                console.log('Help: This is a text-based Othello game.');
            }
            ask.close();
        });
    }
}

class Game_table {
    constructor() {
        this.player1 = "W";
        this.player2 = "B";
        this.current_turn = this.player1;
        this.running = true
        this.row_col = 8;
        this.table = Array.from({ length: this.row_col }, () => Array.from({ length: this.row_col }, () => "."));
        this.logic = new othello_logic(this.row_col);
        let middle_row_col = parseInt(this.row_col / 2) - 1;
        this.table[middle_row_col][middle_row_col] = "W";
        this.table[middle_row_col][middle_row_col + 1] = "B";
        this.table[middle_row_col + 1][middle_row_col] = "B";
        this.table[middle_row_col + 1][middle_row_col + 1] = "W";
        this.logic_table = this.table;
        this.notend = true
        this.show_text_board();
        this.player_input();
    }

    show_text_board() {
        console.clear();
        
        for (let i = 0; i < this.row_col; i++) {
            let row = "";
            for (let j = 0; j < this.row_col; j++) {
                if(this.logic_table[i][j] == this.player1 && this.table[i][j] == this.player2){
                    this.table[i][j] = this.player1
                }else if (this.logic_table[i][j] == this.player2 && this.table[i][j] == this.player1){
                    this.table[i][j] = this.player2
                }
            }
        }
        this.logic_table = this.logic.placeable(this.table, this.current_turn);
        // console.log(this.logic_table)
        console.log("  a  b  c  d  e  f  g  h");
        console.log("  ======================");
        
        for (let i = 0; i < this.row_col; i++) {
            let row = "";
            for (let j = 0; j < this.row_col; j++) {
                // console.log(this.logic_table[i][j],this.table[i][j])
                if (this.logic_table[i][j] == 'O' && this.table[i][j] == '.') {
                    this.notend = false
                    row += this.logic_table[i][j] + "  ";
                }
                else {
                    row += this.table[i][j] + "  ";
                }
            }
            console.log(i + '|' + row.trim());
            console.log("\n");
        }
        if(this.notend == true && this.logic.gameover_count>0){
            console.log('gameover!')
        }
    }

    player_input() {
        while (this.running) {
            if (this.logic.valid_move_avalable ==false){
                break
            }
            if (this.current_turn == "W") {
                if (this.player1 == "W") {
                    console.log("player 1 turn *", this.current_turn, "*");
                } else {
                    console.log("player 2 turn *", this.current_turn, "*");
                }
            } else {
                if (this.player1 == "B") {
                    console.log("player 1 turn *", this.current_turn, "*");
                } else {
                    console.log("player 2 turn *", this.current_turn, "*");
                }
            }

            let posi = prompt('enter your unit position ex: 0a :');
            if (posi.toLowerCase() == 'exit'){
                this.running = false;
                console.clear();
                console.log('you exit the game')
                continue;
            }
            if (posi.length === 2 && !isNaN(posi[0]) && posi[0] >= '0' && posi[0] <= '7' && posi[1] >= 'a' && posi[1] <= 'h') {
                let row = parseInt(posi[0]);
                let col = posi[1].charCodeAt(0) - 'a'.charCodeAt(0);
                if (this.logic_table[row][col] == 'O') {
                    this.logic_table = this.logic.flip(row,col);
                    // console.log(this.logic_table)
                    this.table[row][col] = this.current_turn;
                    this.logic_table[row][col] = this.current_turn;
                    
                } else if (this.table[row][col] == '.') {
                    console.log("this position isn't placeable please select 'O' position");
                } else {
                    this.show_text_board();
                    console.log("this position already taken please choose a new spot");
                    continue;
                }

                if (this.current_turn == this.player1) {
                    this.current_turn = this.player2;
                } else {
                    this.current_turn = this.player1;
                }
                this.show_text_board();
            } else {
                console.log('Invalid input. Please enter a valid position.');
            }
        }
    }
}

class othello_logic {
    constructor(table_size) {
        this.table = null;
        this.check_direction = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
        this.current_player = null;
        this.opposite = null;
        this.size = table_size;
        this.valid_move_avalable = false
        this.gameover_count=0
        // this.posi_to_flip = []
    }

    check_8_direction(x, y) {
        if (this.table[x][y] !== '.') {
            return; 
        }

        let valid = false;

        for (let direction of this.check_direction) {
            let [dix, diy] = direction;
            if (this.check_if_that_posi_valid(x, y, dix, diy)) {
                valid = true;
            }
        }

        if (valid) {
            this.table[x][y] = 'O'; 
            this.valid_move_avalable = true;
        }
    }

    check_if_that_posi_valid(current_x, current_y, direction_x, direction_y) {
        let checking_x = current_x + direction_x;
        let checking_y = current_y + direction_y;
        let opponent_detected = false;

        while (checking_x >= 0 && checking_x < this.size && checking_y >= 0 && checking_y < this.size) {
            if (this.table[checking_x][checking_y] === '.' || this.table[checking_x][checking_y] === 'O') {
                return false; // Invalid move
            } else if (this.table[checking_x][checking_y] === this.opposite) {
                opponent_detected = true;
                // this.posi_to_flip.push([checking_x,checking_y]);
            } else if (this.table[checking_x][checking_y] === this.current_player && opponent_detected) {
                this.valid_move_avalable = true
                return true;
            }else{
                return false;
            }
            checking_x += direction_x;
            checking_y += direction_y;
        }

        return false;
    }

    placeable(table1, p) {
        this.valid_move_avalable = false
        this.table = JSON.parse(JSON.stringify(table1)); // Deep copy the table to avoid modifying the original table
        this.current_player = p;

        if (this.current_player == 'W') {
            this.opposite = 'B';
        } else {
            this.opposite = 'W';
        }

        // console.log('Current Player:', this.current_player);
        // console.log('Opposite Player:', this.opposite);

        for (let i = 0; i < this.size; i++) {
            // console.log('i =', i);
            for (let j = 0; j < this.size; j++) {
                // console.log('j =', j);
                this.check_8_direction(i, j);
            }
        }
        if (this.valid_move_avalable == false){
            if (this.gameover_count>0){
                console.log('gameover')
            }else{
            
            this.gameover_count+=1}
            
        }
        return this.table;
    }
    flip(fx,fy){
        for (let direction of this.check_direction) {
            let [dix, diy] = direction;
            this.flip_direction(fx, fy, dix, diy);
        }
        // console.log(this.table)
        return this.table
    }

    flip_direction(current_x, current_y, direction_x, direction_y) {
        let checking_x = current_x + direction_x;
        let checking_y = current_y + direction_y;
        let positions_to_flip = [];
        // console.log(this.table[checking_x][checking_y],this.opposite)
        while (checking_x >= 0 && checking_x < this.size && checking_y >= 0 && checking_y < this.size) {
            if (this.table[checking_x][checking_y] === '.' || this.table[checking_x][checking_y] === 'O' ) {
                // console.log('kdfhg')
                break
            } else if (this.table[checking_x][checking_y] === this.opposite) {
                // console.log('detect opposite')
                positions_to_flip.push([checking_x, checking_y]);
            } else if (this.table[checking_x][checking_y] === this.current_player) {
                console.log(positions_to_flip,this.current_player);
                // Flip all positions in positions_to_flip
                for (let pos of positions_to_flip) {
                    
                    this.table[pos[0]][pos[1]] = this.current_player;
                    // console.log(this.table[pos[0]][pos[1]],"change",pos[0],pos[1])

                }
                
                return ;
            }
            checking_x += direction_x;
            checking_y += direction_y;
        }

    }
}

start = new Game_menu();
