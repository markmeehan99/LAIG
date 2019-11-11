/**
 * MyPatch
 * 
 */
class MyPatch extends CGFobject {
    constructor(scene, npointsU, npointsV, degree1, degree2, controlVertexes) {
        super(scene);
        this.scene = scene;

        var surface = new CGFnurbsSurface(npointsU, npointsV, controlVertexes);
        this.nurb = new CGFnurbsObject(scene, degree1, degree2, surface);
    }

    display() {
        this.nurb.display();
    }

    applyTextures(lengthS, lengthT) {
        // unused
    }
}