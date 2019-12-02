/**
 * MyKeyframeAnimation
 * extends MyAnimation
 */
class MyKeyframeAnimation extends MyAnimation {
    constructor(keyframes) {
        super();

        // array of MyKeyframe objects
        this.keyframes = keyframes;

        // animation matrix
        this.animMatrix = mat4.create() ;
    }

    interpolate(v0, v1, t) {
        return [
            (1 - t) * v0[0] + t * v1[0],
            (1 - t) * v0[1] + t * v1[1],
            (1 - t) * v0[2] + t * v1[2]
        ];
    }

    update(sceneTime) {
        // position between base transformation and first keyframe 
        var pos0 = -1, pos1 = 0;

        // ms -> s
        sceneTime /= 1000;

        // search for a combination that is the boudaries of sceneTime
        for(var i = 0; i < this.keyframes.length; i++) {
            if (this.keyframes[pos1].instant < sceneTime) {
                pos0++;
                pos1++;
            }
            else break;
        }

        var translate, scale, rotate;

        // special case of first keyframe
        if(pos0 == '-1') {
            var ratio = (sceneTime) / (this.keyframes[pos1].instant);

            translate = this.interpolate([0, 0, 0], this.keyframes[pos1].translate, ratio);
            rotate = this.interpolate([0, 0, 0], this.keyframes[pos1].rotate, ratio);
            scale = this.interpolate([1, 1, 1], this.keyframes[pos1].scale, ratio);
        }
        // special case of last keyframe
        else if (pos1 >= this.keyframes.length) {
            translate = this.keyframes[pos0].translate;
            rotate = this.keyframes[pos0].rotate;
            scale = this.keyframes[pos0].scale;
        }
        // general case
        else {
            var ratio = (sceneTime - this.keyframes[pos0].instant) / (this.keyframes[pos1].instant - this.keyframes[pos0].instant);
        
            translate = this.interpolate(this.keyframes[pos0].translate, this.keyframes[pos1].translate, ratio);
            rotate = this.interpolate(this.keyframes[pos0].rotate, this.keyframes[pos1].rotate, ratio);
            scale = this.interpolate(this.keyframes[pos0].scale, this.keyframes[pos1].scale, ratio);
        }

        var animation = mat4.create();
        animation = mat4.translate(animation, animation, translate);
        animation = mat4.rotate(animation, animation, rotate[0]*DEGREE_TO_RAD, [1, 0, 0]);
        animation = mat4.rotate(animation, animation, rotate[1]*DEGREE_TO_RAD, [0, 1, 0]);
        animation = mat4.rotate(animation, animation, rotate[2]*DEGREE_TO_RAD, [0, 0, 1]);
        animation = mat4.scale(animation, animation, scale);

        this.animMatrix = animation;
    }

    apply() {
        return this.animMatrix;
    }
}