/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTriangle extends CGFobject {
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        super(scene);
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
        
		this.initBuffers();
	}
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
            0, 1, 2,
            1, 0, 2
        ];
        
        //Facing Z positive
        /*this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ];*/

        this.calculateNormals();

        /*
        Texture coords (s,t)
        +----------> s
        |
        |
		|
		v
        t
        */

		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    calculateNormals() {
        this.normals = [];
        // vector 1->2
        let a1 = this.x2 - this.x1;
        let a2 = this.y2 - this.y1;
        let a3 = this.z2 - this.z1;

        // vector 1->3
        let b1 = this.x3 - this.x1;
        let b2 = this.y3 - this.y1;
        let b3 = this.z3 - this.z1;

        // normal vector components
        let nx = a2*b3 - a3*b2;
        let ny = a3*b1 - a1*b3;
        let nz = a1*b2 - a2*b1;

        // vector size to normalize
        let size = Math.sqrt( nx*nx + ny*ny + nz*nz );

        nx /= size;
        ny /= size;
        nz /= size;

        this.normals.push(nx, ny, nz);
        this.normals.push(nx, ny, nz);
        this.normals.push(nx, ny, nz);
    }

    applyTextures(lengthS, lengthT) {
        lengthS = lengthS || 1;
        lengthT = lengthT || 1;

        var c = Math.sqrt( 
                    Math.pow( this.x1 - this.x3 , 2) + 
                    Math.pow( this.y1 - this.y3 , 2) +
                    Math.pow( this.z1 - this.z3 , 2));

        var a = Math.sqrt(
                    Math.pow( this.x2 - this.x1 , 2) +
                    Math.pow( this.y2 - this.y1 , 2) +
                    Math.pow( this.z2 - this.z1 , 2));

        var b = Math.sqrt(
                    Math.pow( this.x3 - this.x2 , 2) +
                    Math.pow( this.y3 - this.y2 , 2) +
                    Math.pow( this.z3 - this.z2 , 2));

        // var cosBeta = ( Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2) ) / (2 * a * c);
        // var aSinBeta = Math.sqrt( Math.pow(a, 2) - Math.pow( a * cosBeta , 2) );

        var cosAlpha = ( a*a - b*b + c*c) / (2*a*c) ;
        var sinAlpha = Math.sqrt( 1 - cosAlpha*cosAlpha );

        // this.texCoords.push( (c - a * cosBeta) / lengthS, (1 - aSinBeta) / lengthT );
        // this.texCoords.push(0, 1 / lengthT);
        // this.texCoords.push(c / lengthS, 1 / lengthT);

        this.texCoords = [
            0, 0,
            a / lengthS, 0,
            c * cosAlpha / lengthS , c * sinAlpha / lengthT
        ];

        this.updateTexCoordsGLBuffers();
    }
}