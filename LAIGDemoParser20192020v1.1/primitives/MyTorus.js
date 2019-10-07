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

		for (var sliceC = 0; sliceC <= this.slices ; sliceC++) {
			var sliceAng = sliceInc * sliceC;
			
            for (var loopC = 0; loopC <= this.loops; loopC++) {
                var loopAng = loopInc * loopC;

                this.vertices.push( 
                                    (this.outer + this.inner*Math.cos(loopAng)) * Math.cos(sliceAng),
                                    (this.outer + this.inner*Math.cos(loopAng)) * Math.sin(sliceAng),
                                    this.inner * Math.sin(loopAng)  
                                  );
				this.calculateNormal(sliceAng, loopAng);
			}
		}
		
		var sides = this.loops+1;
    
        for (var stack_counter = 0; stack_counter < this.slices; stack_counter++) {
            for (var i = 0; i < this.loops; i++) {
    
                this.indices.push(sides*stack_counter+i, sides*(stack_counter+1)+i, sides*stack_counter+i+1);
                this.indices.push(sides*stack_counter+i+1, sides*(stack_counter+1)+i, sides*(stack_counter+1)+i+1);
    
                this.indices.push(sides*stack_counter+i, sides*stack_counter+i+1, sides*(stack_counter+1)+i);
                this.indices.push(sides*stack_counter+i+1, sides*(stack_counter+1)+i+1, sides*(stack_counter+1)+i);
            }
        }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.enableNormalViz();
		this.initGLBuffers();
	}

	calculateNormal(sliceAng, loopAng) {
        
        var x = Math.cos(loopAng) * Math.cos(sliceAng);
        var y = (Math.cos(loopAng)) * Math.sin(sliceAng);
        var z = Math.sin(loopAng);

		var size = Math.sqrt( x*x + y*y + z*z );

		x /= size;
		y /= size;
		z /= size;

		this.normals.push(x, y, z);
	}
}
