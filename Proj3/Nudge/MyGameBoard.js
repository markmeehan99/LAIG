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
        };
        
        let request = this.server.createRequest('initialBoard', null, reply.bind(this));
        console.log(request);
        return this.server.prologRequest(request);
    }

    movePlayer() {

    }

    parseMoveResponse() {

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