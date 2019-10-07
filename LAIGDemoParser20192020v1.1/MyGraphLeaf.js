/**
 * MyGraphLeaf (contains one primitive id)
 * @constructor
 */
class MyGraphLeaf {
    constructor(scene, primType, primId, primArgs) {
        this.scene = scene;
        this.primType = primType;
        this.primId = primId;
        this.primArgs = primArgs;
        this.primitive = null;

        this.initializePrimitive();
    }

    initializePrimitive() {
        switch (this.primType) {
            case 'triangle':
                if (this.primArgs.size != 9)
                    console.log("Triangle " + this.primId + " don't have the correct number of arguments\n");

                this.primitive = new MyTriangle(this.scene, this.primArgs[0], this.primArgs[1], this.primArgs[2],
                    this.primArgs[3], this.primArgs[4], this.primArgs[5],
                    this.primArgs[6], this.primArgs[7], this.primArgs[8]);
                break;

            case 'rectangle':
                if (this.primArgs.size != 4)
                    console.log("Rectangle " + this.primId + " don't have the correct number of arguments\n");

                this.primitive = new MyRectangle(this.scene, this.primArgs[0], this.primArgs[1],
                    this.primArgs[2], this.primArgs[3]);
                break;

            case 'cylinder':
                if (this.primArgs.size != 5)
                    console.log("Cylinder " + this.primId + " don't have the correct number of arguments\n");

                this.primitive = new Cylinder(this.scene, this.primArgs[0], this.primArgs[1],
                    this.primArgs[2], this.primArgs[3], this.primArgs[4]);

                break;

            case 'sphere':
                if (this.primArgs.size != 3)
                    console.log("Sphere " + this.primId + " don't have the correct number of arguments\n");

                this.primitive = new MySphere(this.scene, this.primArgs[0], this.primArgs[1], this.primArgs[2]);

                break;

            case 'torus':
                if (this.primArgs.size != 4)
                    console.log("Torus " + this.primId + " don't have the correct number of arguments\n");

                this.primitive = new MyRectangle(this.scene, this.primArgs[0], this.primArgs[1], this.primArgs[2], this.primArgs[3]);

                break;

            default:
                console.log("Primitive " + this.primId + " is not a valid primitive type\n");
                break;
        }
    }
}