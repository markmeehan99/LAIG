class MyPlayer {

    constructor(color) {
        this.color = color;
        this.score = 0;
    
        this.updateMe = 0;
    }
    

    incrementScore() {
        this.score++;
    }

    getPlayTime() {
        return this.playTime;
    }


}