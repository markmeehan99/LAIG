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

        // this.gameState = null;
        // this.states = [
        //     INITIALMENU,
        //     STARTGAME,
        //     PLAYER1,
        //     PLAYER2,
        //     GAMEOVER
        // ];

        //Start Prolog Server
        this.server = new Connection();
        this.getInitialBoard();
    
    }

    getInitialBoard() {

        let reply = function(data) {
            console.log(data);
            this.board = data;
        };
        
        let request = this.server.createRequest('initialBoard', null, reply.bind(this));
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
        console.log(row, col);
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

    movePlayer(orig, dest) {
        let row = this.coordsToRow(orig);
        let col = this.coordsToCol(orig);
        let direction = this.coordsToDirection(orig, dest);
        // wrong direction
        if(direction == null) return null;

        let reply = function(data) {
            console.log(data);
            this.parseMoveResponse(row, col, direction, data);
        };

        let request = this.server.createRequest('makeMove', [this.getBoardString(), 'white', row, col, direction], reply.bind(this));
        console.log(request);
        return this.server.prologRequest(request);
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

}