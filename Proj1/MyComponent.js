/**
 * MyGraphNode
 * @constructor
 */
class MyComponent {
    constructor(scene, node, transformation, materials, texture, lengthS, lengthT, children, primitives) {
        this.scene = scene;
        this.nodeID = node;
        this.transformation = transformation;
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