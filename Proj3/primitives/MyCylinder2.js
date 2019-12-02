/**
 * MyCylinder2
 */
class MyCylinder2 extends CGFobject {
    constructor(scene, slices, height, top, base, stacks) {
        super(scene);

        // value obtained by theoretical calculations, relation between the radius and the height to get a perfect semi circle
        var heightRatio = 0.75;

        var controlVertexes1 = [
            // U = 0
            [ // V = 0..4
                [-base, 0, 0, 1],
                [-base, base/heightRatio, 0, 1],
                [base, base/heightRatio, 0, 1],
                [base, 0, 0, 1]
            ],
            // U = 1
            [ // V = 0..4
                [-top, 0, height, 1],
                [-top, top/heightRatio, height, 1],
                [top, top/heightRatio, height, 1],
                [top, 0, height, 1]
            ]
        ];

        var controlVertexes2 = [
            // U = 0
            [ // V = 0..4
                [base, 0, 0, 1],
                [base, -base/heightRatio, 0, 1],
                [-base, -base/heightRatio, 0, 1],
                [-base, 0, 0, 1]
            ],
            // U = 1
            [ // V = 0..4
                [top, 0, height, 1],
                [top, -top/heightRatio, height, 1],
                [-top, -top/heightRatio, height, 1],
                [-top, 0, height, 1]
            ]
        ];

        var surface1 = new CGFnurbsSurface(1, 3, controlVertexes1);
        this.nurb1 = new CGFnurbsObject(scene, stacks, slices, surface1);

        var surface2 = new CGFnurbsSurface(1, 3, controlVertexes2);
        this.nurb2 = new CGFnurbsObject(scene, stacks, slices, surface2);
    }

    display() {
        this.nurb1.display();
        this.nurb2.display();
    }

    applyTextures(lengthS, lengthT) {

    }
}