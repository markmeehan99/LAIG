/**
 * MyGraphNode
 * @constructor
 */
class MyComponent {
    constructor(scene, node, transformation, animation, materials, texture, lengthS, lengthT, children, primitives) {
        this.scene = scene;
        this.nodeID = node;
        this.transformation = transformation;
        this.animationID = animation;
        this.materialIDs = materials;
        this.textureID = texture;
        this.lengthS = lengthS;
        this.lengthT = lengthT;
        this.childrenID = children;
        this.primitiveID = primitives;

        this.materialIndex = 0;
    }

    nextMaterial() {
        this.materialIndex = (this.materialIndex+1) % this.materialIDs.length;
    }
}