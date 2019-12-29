/**
 * MyGameBoard
 */
class MyGameBoard{
    constructor() {

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

        if (xi < xo) return 'D';
        else if (xi > xo) return 'U';
        else {
            if (yi < yo) return 'R';
            else if (yi > yo) return 'L';
            else return null;
        }
    }

    parseMoveResponse() {

    }

    movePlayer(orig, dest) {
        let row = this.coordsToRow(orig);
        let col = this.coordsToCol(orig);
        let direction = this.coordsToDirection(orig, dest);

        if(direction == null) return null;

        let reply = function(data) {
            console.log(data);
        };

        let command = 'makeMove(' + this.board + ',black,\'' + row + '\',\'' + col + '\',\'' + direction + '\')';
        console.log(command); 

        // let request = this.server.createRequest(command, null, reply.bind(this));
        // console.log(request);
        // return this.server.prologRequest(request);
    }

    movePiece() {

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

}