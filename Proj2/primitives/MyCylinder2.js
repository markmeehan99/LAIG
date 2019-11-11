/**
 * MyCylinder2
 */
class MyCylinder2 extends CGFobject {
    constructor(scene, slices, height, top, base, stacks) {
        super(scene);

        var controlVertexes = [
            // U = 0
            [ // V = 0..8
                [base, 0, 0, 1],
                [base, -base, 0, 0.707],
                [0, -base, 0, 1],
                [-base, -base, 0, 0.707],
                [-base, 0, 0, 1],
                [-base, base, 0, 0.707],
                [0, base, 0, 1],
                [base, base, 0, 0.707],
                [base, 0, 0, 1]                
            ],
            // U = 1
            [ // V = 0..8
                [top, 0, height, 1],
                [top, -top, height, 0.707],
                [0, -top, height, 1],
                [-top, -top, height, 0.707],
                [-top, 0, height, 1],
                [-top, top, height, 0.707],
                [0, top, height, 1],
                [top, top, height, 0.707],
                [top, 0, height, 1]
            ]
        ];

        var surface = new CGFnurbsSurface(1, 8, controlVertexes);
        this.nurb = new CGFnurbsObject(scene, stacks, slices, surface);
    }

    display() {
        this.nurb.display();
    }

    applyTextures(lengthS, lengthT) {

    }
}