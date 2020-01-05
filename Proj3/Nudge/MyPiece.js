class MyPiece {
    constructor(component, rowCoords, colCoords, color, initialPos) {

        this.componentID = component;
        this.rowPos = this.translateCoordsToPos(rowCoords);
        this.colPos = this.translateCoordsToPos(colCoords);
        this.color = color;

        this.initialPos = initialPos;
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

    move(direction) {
        switch(direction) {
            case '':

            case '':

            case '':

            case '':

            default:
                break;
        }
    }
}