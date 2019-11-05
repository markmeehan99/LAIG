/**
 * MyKeyframeAnimation
 * extends MyAnimation
 */
class MyKeyframeAnimation extends MyAnimation {
    constructor(scene, instant, translateArr, scaleArr, rotateArr) {
        super(scene);
        
        this.instant = instant;
        this.translate = translateArr;
        this.scale = scaleArr;
        this.rotate = rotateArr;
    }

    update(sceneTime) {
        //calculate the 
    }

    apply() {
        
    }
}