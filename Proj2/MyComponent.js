/**
 * MyGraphNode
 * @constructor
 */
class MyComponent {
    constructor(scene, node, transformation, animation, materials, texture, lengthS, lengthT, children, primitives) {
        this.scene = scene;
        this.nodeID = node;
        this.transformation = transformation; // transformation in t=0, no animation
        this.animationID = animation;
        this.materialIDs = materials;
        this.textureID = texture;
        this.lengthS = lengthS;
        this.lengthT = lengthT;
        this.childrenID = children;
        this.primitiveID = primitives;

        // animation transformation to be applied
        this.animTransf = null;
        this.materialIndex = 0;
    }

    update(sceneTime) {
        // call animation.update and add animation.apply to this.animTransf
    }

    nextMaterial() {
        this.materialIndex = (this.materialIndex+1) % this.materialIDs.length;
    }
}