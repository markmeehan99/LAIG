/**
* MyCylinder
* @constructor
*/
class MyCylinder extends CGFobject {
	constructor(scene, slices, height, radius) {
		super(scene);
		this.slices = slices;
		this.height = height;
		this.radius = radius;
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		var ang = 0;
		var alphaAng = 2 * Math.PI / this.slices;
		
		for (var i = 0; i <= this.slices; i++) {

			this.vertices.push(this.radius * Math.cos(ang), 0, this.radius * -Math.sin(ang));
			this.vertices.push(this.radius * Math.cos(ang), this.height, this.radius * -Math.sin(ang));

			this.normals.push(this.radius * Math.cos(ang), 0, this.radius * -Math.sin(ang));
			this.normals.push(this.radius * Math.cos(ang), 0, this.radius * -Math.sin(ang));

			ang += alphaAng;
		}

		for (var i = 0; i < this.slices; i++)
		{
			this.indices.push(i * 2, i * 2 + 2, i * 2 + 1);
			this.indices.push(i * 2 + 2, i * 2 + 3, i * 2 + 1);
		}

		for (var i = 0; i <= this.slices; i++)
		{
			this.texCoords.push( 1/this.slices * i, 1);
			this.texCoords.push( 1/this.slices * i, 0);
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}

