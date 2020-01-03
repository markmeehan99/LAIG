class MyPlayer {

    constructor(color) {
        this.color = color;
        this.score = 0;
        this.clockStarted = false;
        this.playTime = 10;
    }
    
    startCounter() {
        this.playTime = 10;
        this.clockStarted = true;
        this.cicle = setInterval(
          function() {
              
              if (this.playTime == 0) {
                  console.log('Time up!');
                  this.stopCounter();
                  return;
                }
            this.playTime--;
            console.log('Time: ' + this.playTime);

        }.bind(this),
          1000
        );
    }

    stopCounter() {
        clearInterval(this.cicle);
    }


    incrementScore() {
        this.score++;
    }

    getPlayTime() {
        return this.playTime;
    }

    resetTimer() {
        this.playTime = 10;
    }

}