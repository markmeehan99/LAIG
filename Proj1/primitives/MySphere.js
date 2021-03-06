/**
 * MySphere
 * @constructor
 */
class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {

        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];
        
        var stackStep =  Math.PI / this.stacks;
        var sliceStep = 2* Math.PI / this.slices;
        var stackAngle, sliceAngle;
        var lengthInv = 1 / this.radius; // to normalize normals

        for(var i = 0; i <= this.stacks; i++) {
            stackAngle = Math.PI / 2 - i * stackStep;     // starting from pi/2 to -pi/2
            var xy = this.radius * Math.cos(stackAngle); // r * cos(u)
            var z = this.radius * Math.sin(stackAngle);  // r * sin(u)

            // add (sliceCount+1) vertices per vertical
            // the first and last vertices have same position and normal but different texCoords
            for(var j = 0; j <= this.slices; j++) {
                sliceAngle = j * sliceStep; // starting from 0 to 2pi

                //vertex position
                var x = xy * Math.cos(sliceAngle);  // r * cos(u) * cos(v)
                var y = xy * Math.sin(sliceAngle);  // r * cos(u) * sin(v)
                this.vertices.push(x, y, z);

                // normalized vertex normal (nx, ny, nz)
                var nx = x * lengthInv;
                var ny = y * lengthInv;
                var nz = z * lengthInv;
                this.normals.push(nx, ny, nz);

                //vertex texCoords (s, t) range between [0, 1]
                var s = j / this.slices;
                var t = i / this.stacks;
                this.texCoords.push(s, t);
            }
        }

        //indices
        for (var i = 0; i < this.stacks; i++) {
            var k1 = i * (this.slices +1);   // beginning of current vert
            var k2 = k1 + this.slices + 1;   // beginning of next vert
        
            for (var j = 0; j < this.slices; j++, k1++, k2++) {
                // 2 triangles per slice sector excluding first and last vert
                // k1 -> k2 -> k1+1
                if(i != 0) {
                    this.indices.push(k1, k2, k1+1);
                }
                if(i != (this.stacks -1)) {
                    this.indices.push(k1+1, k2, k2+1);
                }
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    applyTextures(lengthS, lengthT) {
        this.texCoords = [];
		for( var i = 0; i <= this.stacks; i++){
			for ( var j = 0; j <= this.slices; j++) {
				this.texCoords.push( j / ( this.slices) , 1 - i / ( this.stacks));
			}
        }
        
		this.updateTexCoordsGLBuffers();
    }
}