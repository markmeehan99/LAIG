class MyPiece {
    constructor(component, rowCoords, colCoords, color) {

        this.componentID = component;
        this.rowPos = this.translateCoordsToPos(rowCoords);
        this.colPos = this.translateCoordsToPos(colCoords);
        this.color = color;
    }

    translatePosToCoords(pos) {
        return 3*pos + 1.5;
    }

    translateCoordsToPos(coord) {
        return (coord - 1.5) / 3;
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