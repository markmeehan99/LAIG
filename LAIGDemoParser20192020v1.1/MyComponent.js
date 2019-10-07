/**
 * MyGraphNode
 * @constructor
 */
class MyComponent {
    constructor(scene, nodeId) {
        this.scene = scene;
        this.nodeId = nodeId;

        //transformations
        this.transformationsId = [];

        //material
        this.materialsId = [];

        //texture
        this.textureId = null;

        //children
        this.childrenId = [];
        this.primitivesId = [];
    }

    addTransformation(transId) {
        this.transformationsId.push(transId);
    }

    addMaterial(mateId) {
        this.materialsId.push(mateID);
    }

    setTexture(textId) {
        this.textureId = textId;
    }

    addChild(nodeId) {
        this.childrenId.push(nodeId);
    }

    addLeaf(leafId) {
        this.leafsId.push(leafId);
    }

}