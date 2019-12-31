/**
 * MyGameBoard
 */
class MyGameBoard{
    constructor(scene) {
        this.scene = scene;

        this.board = [];
        this.pieces = [];
        // array with MyLastMov obj, representing all the plays
        this.lastMovements = [];

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

        this.botStarted = 0;

        this.server = new Connection();
        this.connectionSuccess=0;
        this.moveAllowed = 1;

        this.currentState = this.state.WHITE_FIRST_TURN;
        this.currentMode = this.mode.BOT_VS_BOT; //TODO: change when other modes are added

        //Start Prolog Server

        this.startConnection();

        this.getInitialBoard();
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
            return [];
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
        this.movePiece(row, col, nextRow, nextCol); 
    }

    parseMoveResponse(row, col, direction, newBoard) {
        let oldBoard = this.board;
        this.board = newBoard;

        this.lastMovements.push(new MyLastMov(row, col, direction));

        this.movePieces(oldBoard, row, col, direction);
    }

    allowBot() {
        setInterval(function() {
            let player = this.getPlayer();
            this.moveBot(player);
        }.bind(this), 6000);

        this.botStarted = 1;

    }


    botGameLoop() {
        let player = this.getPlayer();
        this.moveBot(player);
    }



    parseBotMoveResponse(data) {
        let oldBoard = this.board;
                
        this.board = data[0];
        console.log('New Board updated!');
        
        let row = data[1];
        
        let col = data[2];
        
        let direction = data[3];
        
        this.lastMovements.push(new MyLastMov(row, col, direction));
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
        };

        let reply = function(data) {
            this.updateTurn();
            this.parseMoveResponse(row, col, direction, data);
        };

        let request = this.server.createRequest('makeMove', [this.getBoardString(), player, row, col, direction], reply.bind(this), failure.bind(this));
        this.server.prologRequest(request);
    }

    moveBot(player) {
        let failure = function() {
            console.log('INVALID MOVE!')
        };

        let reply = function(data) {
            this.updateTurn();
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

    movePiece(row, col, newRow, newCol) {
        // find current position piece and update position
        let piece = this.findPieceOfPos(row, col);
        piece.setPos(newRow, newCol);

        let oldRowCoord = piece.translatePosToCoords(row);
        let oldColCoord = piece.translatePosToCoords(col);
        let newRowCoord = piece.translatePosToCoords(newRow);
        let newColCoord = piece.translatePosToCoords(newCol);
        let animation = new MyLinearAnimation(oldRowCoord, oldColCoord, newRowCoord, newColCoord);
        let component = this.scene.graph.components[piece.componentID];
        component.animation = animation;
    }

    undo() {

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
            console.log('Connection established');
        };

        let request = this.server.createRequest('handshake', null, reply.bind(this));
        return this.server.prologRequest(request);
    }

    updateTurn() {
        if (this.currentState == 1) this.currentState++;
        else if (this.currentState == 2) this.currentState++;
        else if (this.currentState == 3) this.currentState++;
        else if (this.currentState == 4) this.currentState = 1;
        console.log(this.currentState);
    }


}