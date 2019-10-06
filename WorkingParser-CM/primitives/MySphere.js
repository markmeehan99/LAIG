/**
 * MySphere
 * @constructor
 */

class MySphere extends CGFobject{
    constructor(scene, radius, slices, stacks) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    };

    initBuffers(){

        this.vertices = [];
        this.indices = [];
        this.normals = [];
    
        var vert_ang = 0.0;
        var hor_ang = 0.0;
        var increment = 2 * Math.PI / this.slices;
    
        for (var stack_c = 0; stack_c <= this.stacks; stack_c++) {
            var z = this.radius * Math.cos(vert_ang);
            for (var slice_c = 0; slice_c <= this.slices; slice_c++) {
                var y = this.radius * Math.sin(vert_ang) * Math.cos(hor_ang);
                var x = this.radius * Math.sin(vert_ang) * Math.sin(hor_ang);
                this.vertices.push(x, y, z);
                this.normals.push(x, y, z);
                hor_ang += increment;
            }
            hor_ang = 0.0;
            vert_ang += Math.PI / this.stacks;
        }
    
        for (var stack_c = 0; stack_c < this.stacks; stack_c++) {
            for (var slice_c = 0; slice_c < this.slices; slice_c++) {
                var index1 = slice_c + stack_c * (this.slices + 1);
                var index2 = slice_c + stack_c * (this.slices + 1) + 1;
                var index3 = slice_c + (stack_c + 1) * (this.slices + 1);
                var index4 = slice_c + (stack_c + 1) * (this.slices + 1) + 1;
                this.indices.push(index4, index3, index1);
                this.indices.push(index1, index2, index4);
            }
        }        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    };

    applyTextures(factorS,factorT){
        factorS = factorS || 1;
        factorT = factorT || 1;
        this.texCoords = [];

        for (var stack_c = 0; stack_c <= this.stacks; stack_c++) {
            var v = stack_c / this.stacks;
            for (var slice_c = 0; slice_c <= this.slices; slice_c++) {
                var u = 1 - (slice_c / this.slices);
                this.texCoords.push(u * factorS, v * factorT);
            }
        }

        this.updateTexCoordsGLBuffers();
    }

}