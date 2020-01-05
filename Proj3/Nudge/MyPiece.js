class MyPiece {
    constructor(component, rowCoords, colCoords, color) {

        this.componentID = component;
        this.rowPos = this.translateCoordsToPos(rowCoords);
        this.colPos = this.translateCoordsToPos(colCoords);
        this.color = color;

        this.initialRow = this.rowPos;
        this.initialCol = this.colPos;
    }

    translatePosToCoords(pos) {
        return 3*pos + 1.5;
    }

    translateCoordsToPos(coord) {
        return (coord - 1.5) / 3;
    }

    setPos(row, col) {
        this.rowPos = row;
        this.colPos = col;
    }

    resetPos() {
        this.rowPos = this.initialRow;
        this.colPos = this.initialCol;
    }

}