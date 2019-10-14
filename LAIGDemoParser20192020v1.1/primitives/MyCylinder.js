/**
* MyCylinder
* @constructor
*/
class MyCylinder extends CGFobject {
	constructor(scene, slices, height, top, base, stacks) {
		super(scene);
		this.slices = slices;
        this.stacks = stacks;
        this.base = base;
        this.top = top;
		this.height = height;
		
		this.con = true;
		
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		var n = 2 * Math.PI / this.slices;
		var radius_diff = (this.top - this.base) / this.stacks;
		var stack_height = this.height / this.stacks;

		for (var stack_counter = 0; stack_counter < this.stacks+1 ; stack_counter++) {
			
			var inc = (stack_counter * radius_diff) + this.base;
			
            for (var i = 0; i <= this.slices; i++) {
                this.vertices.push(inc * Math.cos(i * n), inc * Math.sin(i * n), stack_counter * stack_height);
				this.calculateNormal(n, i);
			}
		}
		
		var sides = this.slices +1;
    
        for (var stack_counter = 0; stack_counter < this.stacks; stack_counter++) {
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

	calculateNormal(n, i) {
		var x = Math.cos(i * n);
		var y = Math.sin(i * n);
		var z = -(this.top - this.base)/(this.height);

		var size = Math.sqrt( x*x + y*y + z*z );

		x /= size;
		y /= size;
		z /= size;

		this.normals.push(x, y, z);
	}

	applyTextures(lengthS, lengthT) {
		this.texCoords = [];
		// for( var i = 0; i <= this.stacks; i++){
		// 	for ( var j = 0; j <= this.slices; j++) {
		// 		if (this.con) {
		// 			console.log("stack: " + i + "/" + this.stacks + " slice: " + j + "/" +this.slices + "  vertices: " + this.vertices.length);
		// 		}
		// 		this.texCoords.push( j / ( lengthS * this.slices) , i / ( lengthT * this.stacks));
		// 	}
		// }
		// this.con=false;
	}
}
