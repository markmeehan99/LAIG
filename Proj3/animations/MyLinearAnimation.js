class MyLinearAnimation extends MyAnimation {
    constructor(zOld, xOld, zNew, xNew) {
        super();

        // this.zOld = zOld;
        // this.zNew = zNew;

        // this.xOld = xOld;
        // this.xNew = xNew;

        // this.oldCoords = [xOld, 0, zOld];
        // this.newCoords = [xNew, 0, zNew];

        this.translate = [
            xNew - xOld,
            0,
            zNew - zOld
        ];

        this.animMatrix = mat4.create();

        this.ended = false;
        this.lastSent = false;

        this.firstTime = null;
    }

    interpolate(v0, v1, t) {
        return [
            (1 - t) * v0[0] + t * v1[0],
            (1 - t) * v0[1] + t * v1[1],
            (1 - t) * v0[2] + t * v1[2],
        ];
    }

    update(sceneTime) {

        if (this.firstTime == null) {
            this.firstTime = sceneTime;
        }

        // // ms -> s
        // sceneTime /= 1000;

        let ratio = (sceneTime - this.firstTime) / 1000;

        // 1s of animation
        if (ratio > 1) {
            ratio = 1;
            this.ended = true;
        }

        let translate = this.interpolate([0, 0, 0], this.translate, ratio);
        let animation = mat4.create();
        animation = mat4.translate(animation, animation, translate);
        this.animMatrix = animation;
    }

    apply() {
        if (this.ended && this.lastSent)
            return null;
        else if (this.ended && !this.lastSent) {
            this.lastSent = true;
            return this.animMatrix;
        }
        else return this.animMatrix;
    }
}