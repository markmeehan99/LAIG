/**
* MyTorus
* @constructor
*/
class MyTorus extends CGFobject {
	constructor(scene, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
		
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
        var sliceInc = 2 * Math.PI / this.slices;
        var loopInc = 2 * Math.PI / this.loops;

		for (var loopC = 0; loopC <= this.loops ; loopC++) {
			var loopAng = loopInc * loopC;
			
            for (var sliceC = 0; sliceC <= this.slices; sliceC++) {
                var sliceAng = sliceInc * sliceC;

                this.vertices.push( 
                                    (this.outer + this.inner*Math.cos(sliceAng)) * Math.cos(loopAng),
                                    (this.outer + this.inner*Math.cos(sliceAng)) * Math.sin(loopAng),
                                    this.inner * Math.sin(sliceAng)  
                                  );
				this.calculateNormal(loopAng, sliceAng);
			}
		}
		
		var sides = this.slices+1;
    
        for (var stack_counter = 0; stack_counter < this.loops; stack_counter++) {
            for (var i = 0; i < this.slices; i++) {
    
                this.indices.push(sides*stack_counter+i, sides*(stack_counter+1)+i, sides*stack_counter+i+1);
                this.indices.push(sides*stack_counter+i+1, sides*(stack_counter+1)+i, sides*(stack_counter+1)+i+1);
    
                this.indices.push(sides*stack_counter+i, sides*stack_counter+i+1, sides*(stack_counter+1)+i);
                this.indices.push(sides*stack_counter+i+1, sides*(stack_counter+1)+i+1, sides*(stack_counter+1)+i);
            }
        }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	calculateNormal(loopAng, sliceAng) {
        
        var x = Math.cos(sliceAng) * Math.cos(loopAng);
        var y = (Math.cos(sliceAng)) * Math.sin(loopAng);
        var z = Math.sin(sliceAng);

		var size = Math.sqrt( x*x + y*y + z*z );

		x /= size;
		y /= size;
		z /= size;

		this.normals.push(x, y, z);
    }

    /**
     * Applies the texture coords to the primitive, considering the factorS and T of the texture
     * @param {float} lengthS 
     * @param {float} lengthT 
     */
    applyTextures(lengthS, lengthT) {
        this.texCoords = [];
		// for( var i = 0; i <= this.loops; i++){
		// 	for ( var j = 0; j <= this.slices; j++) {
		// 		this.texCoords.push( j / ( lengthS * this.slices) , i / ( lengthT * this.loops));
		// 	}
		// }
    }
}
