/**
 * MyGraphNode
 * @constructor
 */
class MyComponent {
    constructor(scene, node, transformation, animation, materials, texture, lengthS, lengthT, children, primitives) {
        this.scene = scene;
        this.nodeID = node;
        this.transformation = transformation;
        this.animation = animation;
        this.materialIDs = materials;
        this.textureID = texture;
        this.lengthS = lengthS;
        this.lengthT = lengthT;
        this.childrenID = children;
        this.primitiveID = primitives;

        this.animMatrix = null;
        this.lastAnim = null;

        this.materialIndex = 0;
    }

    update(sceneTime) {
        if(this.animation == null) return;
        
        this.animation.update(sceneTime);
        this.lastAnim = this.animMatrix;
        this.animMatrix = this.animation.apply();
        
        //returning null, animation ended
        if(this.animMatrix == null) {
            mat4.multiply(this.transformation, this.transformation, this.lastAnim);
            this.animMatrix = null;
            this.animation = null;
            return;
        }
    }

    nextMaterial() {
        this.materialIndex = (this.materialIndex+1) % this.materialIDs.length;
    }
}