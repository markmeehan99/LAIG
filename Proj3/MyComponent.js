/**
 * MyGraphNode
 * @constructor
 */
class MyComponent {
    constructor(node, theme, transformation, animation, materials, texture, lengthS, lengthT, children, primitives) {
        
        this.nodeID = node;
        this.theme = theme;
        this.transformation = mat4.clone(transformation);
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

        this.initialCoords = mat4.clone(transformation);
    }

    chooseTexture(theme) {
        if (Array.isArray(this.textureID)) {
            if(this.textureID[theme] == null)
                return this.textureID['default'];
            else return this.textureID[theme];
        }

        return this.textureID;
    }

    chooseLengthS(theme) {
        if (Array.isArray(this.lengthS)) {
            if(this.lengthS[theme] == null)
                return this.lengthS['default'];
            else return this.lengthS[theme];
        }

        return this.lengthS;
    }

    chooseLengthT(theme) {
        if (Array.isArray(this.lengthT)) {
            if(this.lengthT[theme] == null)
                return this.lengthT['default'];
            else return this.lengthT[theme];
        }

        return this.lengthT;
    }

    resetTransf() {
        this.transformation = mat4.clone(this.initialCoords);
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