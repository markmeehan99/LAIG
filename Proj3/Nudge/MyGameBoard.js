/**
 * MyGameBoard
 */
class MyGameBoard{
    constructor(scene, mode) {
        this.scene = scene;

        this.board = [];
        this.lastBoard = [];
        this.lastlastBoard = [];
        this.pieces = [];
        // array with MyGameMove obj, representing all the plays
        this.lastMovements = [];


        this.turning = 0;

        this.state = { 
            WAITING_FOR_START: 0,
            WHITE_FIRST_TURN: 1,
            WHITE_SECOND_TURN: 2,
            BLACK_FIRST_TURN: 3,
            BLACK_SECOND_TURN: 4,
            WHITE_WIN:5,
            BLACK_WIN: 6,
            CONNECTION_ERROR: 7,
        };

        this.mode = { 
            PLAYER_VS_PLAYER: 0,
            PLAYER_VS_BOT: 1,
            BOT_VS_BOT: 2
        };

        this.white_wins = 0;
        this.black_wins = 0;

        this.playerBlack = new MyPlayer('black');
        this.playerWhite = new MyPlayer('white');


        this.botStarted = 0;
        this.botMoveMade = 0;

        this.server = new Connection();
        this.connectionSuccess=0;
        this.moveAllowed = 1;

        this.currentState = this.state.WAITING_FOR_START;
        this.currentMode = mode; //TODO: change when other modes are added

        this.playTime = 10;
        this.clockStarted = false;


        //Start Prolog Server

        // this.startConnection();

        this.startConnection();
        var refreshId = setInterval(function() {
            if (this.currentState > 0) {
              clearInterval(refreshId);
              return;
            } else {
                console.log('Sending handshake');
                this.startConnection();
            }
          }.bind(this), 5000);

    }

    getInitialBoard() {

        let failure = function(data) {
            console.log(data);
            return 400;
        };
        

        let reply = function(data) {
            this.board = data;

            console.log('Initial Board loaded!');
        };
        
        let request = this.server.createRequest('initialBoard', null, reply.bind(this), failure);
        console.log(request);
        return this.server.prologRequest(request);
    }

    coordsToRow(coords) {
        return Math.floor(coords/10) - 1;
    }

    coordsToCol(coords) {
        return coords%10 - 1;
    }

    coordsToDirection(orig, dest) {
        let xi = this.coordsToRow(orig);
        let yi = this.coordsToCol(orig);
        let xo = this.coordsToRow(dest);
        let yo = this.coordsToCol(dest);

        if ( xi != xo && yi != yo) return null;

        if (xi < xo) return 'd';
        else if (xi > xo) return 'u';
        else {
            if (yi < yo) return 'r';
            else if (yi > yo) return 'l';
            else return null;
        }
    }

    movePieces(oldBoard, row, col, dir) {
        if (oldBoard[row][col] == 'empty') { 
            return;
        }

        // get next coords
        let nextRow = row;
        let nextCol = col;
        switch (dir) {
            case 'u':
                nextRow -= 1;
                break;
            case 'd':
                nextRow += 1;
                break;
            case 'l':
                nextCol -= 1;
                break;
            case 'r':
                nextCol += 1;
                break;
        }

        // go find next pieces in movement
        this.movePieces(oldBoard, nextRow, nextCol, dir);

        // find piece, moves it and 
        this.movePiece(row, col, nextRow, nextCol, 600); 
    }

    parseMoveResponse(row, col, direction, newBoard) {
        this.lastlastBoard = this.lastBoard;
        this.lastBoard = this.board;
        this.board = newBoard;

        this.lastMovements.push(new MyGameMove(row, col, direction));

        this.movePieces(this.lastBoard, row, col, direction);
    }

    allowBot() {
        setInterval(function() {
            let player = this.getPlayer();
            this.moveBot(player);
        }.bind(this), 6000);

        this.botStarted = 1;

    }

    oneBotMove() {
        this.botMoveMade = 1;

        setTimeout(function(){ 
            let player = this.getPlayer();
            this.moveBot(player);
        }.bind(this), 3000);

    }

    botGameLoop() {
        let player = this.getPlayer();
        this.moveBot(player);
    }

    parseBotMoveResponse(data) {
        let oldBoard = this.board;
                
        this.board = data[0];

        if (this.checkGameOver()) console.log('Game Over!');
        else console.log('Game not over');

        console.log('New Board updated!');
        
        let row = data[1];
        
        let col = data[2];
        
        let direction = data[3];
        
        this.lastMovements.push(new MyGameMove(row, col, direction));
        this.movePieces(oldBoard, row, col, direction);
    }

    movePlayer(orig, dest, player) {
        let row = this.coordsToRow(orig);
        let col = this.coordsToCol(orig);

        let direction = this.coordsToDirection(orig, dest);

        // wrong direction
        if(direction == null) return null;

        let failure = function(data) {
            console.log(data);
            this.resetTimer();
            this.stopCounter();
            this.startCounter();
        };

        let reply = function(data) {
      
            this.updateTurn();
            this.parseMoveResponse(row, col, direction, data);
            
            if (this.checkGameOver()) console.log('Game Over!');
            else console.log('Game not over');
            
            // setTimeout(() => this.startCounter(), 1400);
            console.log('Player Moved. Setting new clock');
            this.clockStarted = 1;
        };

        let request = this.server.createRequest('makeMove', [this.getBoardString(), player, row, col, direction], reply.bind(this), failure.bind(this));
        console.log('Sending request: ' + request);
        this.server.prologRequest(request);
    }

    moveBot(player) {
        let failure = function() {
            console.log('INVALID MOVE!')
        };

        let reply = function(data) {
            this.updateTurn();
            this.botMoveMade = 0;
            this.parseBotMoveResponse(data);
        };

        
        console.log('NEW REQUEST')
        let request = this.server.createRequest('botMove', [this.getBoardString(), player], reply.bind(this), failure.bind(this));
        this.server.prologRequest(request);
    }

    getPlayer() {
        if (this.currentState == 1 || this.currentState == 2) return 'white';
        if (this.currentState == 3 || this.currentState == 4) return 'black';
    }

    movePiece(row, col, newRow, newCol, time) {
        // find current position piece and update position
        let piece = this.findPieceOfPos(row, col);
        piece.setPos(newRow, newCol);

        let oldRowCoord = piece.translatePosToCoords(row);
        let oldColCoord = piece.translatePosToCoords(col);
        let newRowCoord = piece.translatePosToCoords(newRow);
        let newColCoord = piece.translatePosToCoords(newCol);
        let animation = new MyLinearAnimation(oldRowCoord, oldColCoord, newRowCoord, newColCoord, time);
        let component = this.scene.graph.components[piece.componentID];
        component.animation = animation;
    }

    movePiecesUndo(board, row, col, dir) {
        console.log(row, col);

        if (board[row][col] == 'empty') {
            return;
        }

        let pieceRow = row;
        let pieceCol = col;
        switch (dir) {
            case 'u':
                pieceRow -= 1;
                break;
            case 'd':
                pieceRow += 1;
                break;
            case 'l':
                pieceCol -= 1;
                break;
            case 'r':
                pieceCol += 1;
                break;
        }

        // find piece, move it 
        this.movePiece(pieceRow, pieceCol, row, col, 250);

        // go find next pieces in undo
        setTimeout(() => this.movePiecesUndo(board, pieceRow, pieceCol, dir), 80);

    }

    undo() {
        if (this.canUndo) {
            console.log(this.lastMovements[this.lastMovements.length - 1])
            if (this.currentState == 1) this.currentState = 4;
            else this.currentState--;

            this.board = this.lastBoard;
            this.lastBoard = this.lastlastBoard;
            let lastMov = this.lastMovements.pop();

            this.movePiecesUndo(this.board, lastMov.row, lastMov.col, lastMov.direction);
        }


    }

    findPosOfPieceID(id) {
        for (let i = 0; i < this.pieces.length; i++) {
            let piece = this.pieces[i];
            if (piece.componentID == id) {
                return piece.rowPos*10 + piece.colPos;
            }
        }
    }

    findColorOfPieceCoords(row, col) {
        for (let i = 0; i < this.pieces.length; i++) {
            let piece = this.pieces[i];
            if (piece.rowPos == row && piece.colPos == col) {
                return piece.color;
            }
        }
    }

    findPieceOfPos(row, col) {
        for (let i = 0; i < this.pieces.length; i++) {
            let piece = this.pieces[i];
            if (piece.rowPos == row && piece.colPos == col) {
                return piece;
            }
        }
    }

    getBoardString() {
        return JSON.stringify(this.board);
    }

    startConnection() {
        //make a handshake request to server         

        let reply = function(data) {
            this.connectionSuccess = 1;
            this.currentState = 1;
            this.getInitialBoard();
            console.log('Connection established');
        };

        let request = this.server.createRequest('handshake', null, reply.bind(this));
        return this.server.prologRequest(request);
    }

    updateTurn() {
        this.canUndo = true;

        if (this.currentState == 1) {
            this.currentState++;
            this.resetTimer();
            this.startCounter();
        }
        else if (this.currentState == 2) {
            this.currentState++;

            setTimeout(() => { 
                this.canUndo = false; 
                if (this.currentState == 3)
                    this.scene.rotateCam();
            }, 3000);

            setTimeout(() => this.resetTimer(), 3000);
            setTimeout(() => this.startCounter(), 3000);
        }
        else if (this.currentState == 3) {
            this.currentState++;
            this.resetTimer();
            this.startCounter();
        }
        else if (this.currentState == 4) {
            this.currentState = 1;

            setTimeout(() => { 
                this.canUndo = false; 
                if (this.currentState == 1)
                    this.scene.rotateCam(); 
            }, 3000);

            setTimeout(() => this.resetTimer(), 3000);
            setTimeout(() => this.startCounter(), 3000);
        }
        console.log(this.currentState);
    }

    
    startCounter() {
        this.playTime = 10;
        this.clockStarted = true;
        this.cicle = setInterval(
          function() {

            var player = this.getPlayer();
              
              if (this.playTime == 0) {
                  console.log('Time up!');
                  this.stopCounter();
                  console.log('updating turn');
                    this.updateTurn();
                    this.updateMe = 1;
                  return;
                }
            this.playTime--;

        }.bind(this),
          1000
        );
    }

    
    stopCounter() {
        console.log('Stopping clock');
        clearInterval(this.cicle);
    }

    
    resetTimer() {
        this.playTime = 10;
    }
   

    getScore() {
        return "White wins: " + parseInt(this.white_wins) + "\n" + 
        "Black wins: " + parseInt(this.black_wins) + "\n";
    }

    checkGameOver() {

        //First line
        for (var i=0; i < this.board.length; i++)
            if (this.board[0][i] != 'empty') return true;
        
        //Last line
        for (var i=0; i < this.board.length; i++)
            if (this.board[6][i] != 'empty') return true;


        //First and last cells of each middle line
        for (var i=0; i < this.board.length; i++)
            if (this.board[i][0] != 'empty' || this.board[i][6] != 'empty') return true;

        return false;
    }

}