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
		
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		var n = 2 * Math.PI / this.slices;
		var radius_diff = Math.abs(this.top - this.base) / this.stacks;
		var stack_height = this.height / this.stacks;

		for (var stack_counter = 0; stack_counter < this.stacks+1 ; stack_counter++) {
			
			var inc = (stack_counter * radius_diff) + this.base;
			
            for (var i = 0; i <= this.slices; i++) {
                this.vertices.push(inc * Math.cos(i * n), inc * Math.sin(i * n), stack_counter * stack_height);
                this.normals.push(Math.cos(i * n), Math.sin(i * n), 0);  
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
}
