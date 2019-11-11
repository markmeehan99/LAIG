/**
 * MyPlane
 * 
 */
class MyPlane extends CGFobject {
    constructor(scene, degree1, degree2) {
        super(scene);
        this.scene = scene;

        var controlVertexes = [
            // U = 0
            [ // V = 0..1
                [-0.5, 0, -0.5, 1],
                [ 0.5, 0, -0.5, 1]
            ],
            // U = 1
            [ // V = 0..1
                [-0.5, 0, 0.5, 1],
                [ 0.5, 0, 0.5, 1]
            ]
        ];

        var surface = new CGFnurbsSurface(1, 1, controlVertexes);
        this.nurb = new CGFnurbsObject(scene, degree1, degree2, surface);
    }

    display() {
        this.nurb.display();
    }

    applyTextures(lengthS, lengthT) {
        // unused
    }
}