var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <globals>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");

            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;

        this.defaultView = this.reader.getString(viewsNode, "default");
        if (this.defaultView == null)
                return "no ID defined for default view";
        // TODO: verificar erro 

        this.views = [];
        this.secCams = [];

        var numViews = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of views.
        for (var i = 0; i < children.length; i++) {
            
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current view.
            var viewId = this.reader.getString(children[i], 'id');
            if (viewId == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";
            
            // near
            var near = this.reader.getFloat(children[i], 'near');
            if (!(near != null && !isNaN(near)))
                return "unable to parse near of the view coordinates for ID = " + viewId;

            // far
            var far = this.reader.getFloat(children[i], 'far');
            if (!(far != null && !isNaN(far)))
                return "unable to parse far of the view coordinates for ID = " + viewId;

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }
            
            var fromIndex = nodeNames.indexOf("from");
            var toIndex = nodeNames.indexOf("to");

            if (fromIndex == -1 || toIndex == -1) 
                this.onXMLMinorError("from or to are not defined in view for ID " + viewId);

            var from = this.parseCoordinates3D(grandChildren[fromIndex], "from view for ID " + viewId);
            if(!Array.isArray(from))
                return from;

            var to = this.parseCoordinates3D(grandChildren[toIndex], "to view for ID " + viewId);
            if(!Array.isArray(to))
                return to;

            // Specifications for the current view.
            var viewType = children[i].nodeName;

            var cam1;
            var cam2;
            // Retrieves the view parameters.
            if (viewType == 'perspective') {

                //angle
                var angle = this.reader.getFloat(children[i], "angle");
                if (!(angle != null && !isNaN(angle)))
                return "unable to parse angle of the view coordinates for ID = " + viewId;

                angle *= DEGREE_TO_RAD;
                cam1 = new CGFcamera(angle, near, far, vec3.fromValues(...from), vec3.fromValues(...to));
                cam2 = new CGFcamera(angle, near, far, vec3.fromValues(...from), vec3.fromValues(...to));
            }
            if (viewType == 'ortho') {

                //left
                var left = this.reader.getFloat(children[i], "left");
                if (!(left != null && !isNaN(left)))
                return "unable to parse left of the view coordinates for ID = " + viewId;

                //right
                var right = this.reader.getFloat(children[i], "right");
                if (!(right != null && !isNaN(right)))
                return "unable to parse right of the view coordinates for ID = " + viewId;

                //top
                var top = this.reader.getFloat(children[i], "top");
                if (!(top != null && !isNaN(top)))
                return "unable to parse top of the view coordinates for ID = " + viewId;

                //bottom
                var bottom = this.reader.getFloat(children[i], "bottom");
                if (!(bottom != null && !isNaN(bottom)))
                return "unable to parse bottom of the view coordinates for ID = " + viewId;

                //up
                var upIndex = nodeNames.indexOf("up");
                var up = [0, 1, 0];
                if (upIndex != -1) {
                    up = this.parseCoordinates3D(grandChildren[upIndex], "up view for ID " + viewId);
                    if (!Array.isArray(up))
                        return up;
                } 

                cam1 = new CGFcameraOrtho(left, right, bottom, top, near, far, vec3.fromValues(...from), vec3.fromValues(...to), vec3.fromValues(...up));
                cam2 = new CGFcameraOrtho(left, right, bottom, top, near, far, vec3.fromValues(...from), vec3.fromValues(...to), vec3.fromValues(...up));
            }
            this.views[viewId] = cam1;
            this.secCams[viewId] = cam2;
            
            if (viewId == 'player1') {
                this.scene.resetCameraFrom = from;
                this.scene.resetCameraTo = to;
            }

            numViews++;
        }

        if (this.views[this.defaultView] == null) {
            return "the default view doesn't correspond to any view ID";
        }

        if(numViews == 0) 
            return "there must be at least one view";

        this.log("Parsed views");

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux ? true : false;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            var attenuationIndex = nodeNames.indexOf('attenuation');
            if(attenuationIndex == -1)
                return "no attenuation defined in light for ID " + lightId;

            var constant = this.reader.getFloat(grandChildren[attenuationIndex], 'constant');
            if (!(constant != null && !isNaN(constant) && constant >= 0 && constant <= 1))
                return "unable to parse constant attenuation of the light for ID = " + lightId;
            
            var linear = this.reader.getFloat(grandChildren[attenuationIndex], 'linear');
            if (!(linear != null && !isNaN(linear) && linear >= 0 && linear <= 1))
                return "unable to parse linear attenuation of the light for ID = " + lightId;
            
            var quadratic = this.reader.getFloat(grandChildren[attenuationIndex], 'quadratic');
            if (!(quadratic != null && !isNaN(quadratic) && quadratic >= 0 && quadratic <= 1))
                return "unable to parse quadratic attenuation of the light for ID = " + lightId;
    
            global.push(...[constant, linear, quadratic]);
    

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        var children = texturesNode.children;

        this.textures = [];
        var numTextures = 0;

        // Any number of textures.
        for (var i = 0; i < children.length; i++) {

            //Check texture
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current texture.
            var textureId = this.reader.getString(children[i], 'id');
            if (textureId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.textures[textureId] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureId + ")";

            //file
            var file = this.reader.getString(children[i], 'file');
            if (file == null)
                return "no file defined for texture to ID " + textureId;

            if (file.match(/\.png$/) == null && file.match(/\.jpg$/) == null) 
                this.onXMLMinorError("the file for texture ID " + textureId + " is in a wrong format {png or jpg}\n");

            var text = new CGFtexture(this.scene, file);
            this.textures[textureId] = text;
        }
        
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            var shininess = this.reader.getFloat(children[i], "shininess");
            if (!(shininess != null) && !isNaN(shininess))
                return "unable to parse shininess of material for ID = " + materialID;

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var emissionIndex = nodeNames.indexOf("emission");
            var ambientIndex = nodeNames.indexOf("ambient");
            var diffuseIndex = nodeNames.indexOf("diffuse");
            var specularIndex = nodeNames.indexOf("specular");

            if (emissionIndex == -1 || ambientIndex == -1 || diffuseIndex == -1 || specularIndex == -1)
                this.onXMLMinorError("emission, ambient, diffuse or specular are not defined in material for ID " + materialID);
            
            var emission = this.parseColor(grandChildren[emissionIndex],  "emission material for ID " + materialID);
            if (!Array.isArray(emission))
                return emission;

            var ambient = this.parseColor(grandChildren[ambientIndex], "ambient material for ID "  + materialID);
            if (!Array.isArray(ambient))
                return ambient;

            var diffuse = this.parseColor(grandChildren[diffuseIndex], "diffuse material for ID "  + materialID);
            if (!Array.isArray(diffuse))
                return diffuse; 

            var specular = this.parseColor(grandChildren[specularIndex], "specular material for ID "  + materialID);
            if (!Array.isArray(specular))
                return specular;  
                
            var mat = new CGFappearance(this.scene);
            mat.setTextureWrap('REPEAT', 'REPEAT');
            mat.setShininess(shininess);
            mat.setEmission(emission[0], emission[1], emission[2], emission[3]);
            mat.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
            mat.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
            mat.setSpecular(specular[0], specular[1], specular[2], specular[3]);

            this.materials[materialID] = mat;
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        // angle
                        var angle = this.reader.getFloat(grandChildren[j], "angle");
                        if (!(angle != null && !isNaN(angle))) {
                            this.onXMLMinorError("unable to parse transformation rotate for ID " + transformationID);
                        }
                        //axis
                        var axis = this.reader.getString(grandChildren[j], "axis");
                        if(!(axis != null)) {
                            this.onXMLMinorError("unable to parse transformation rotate for ID " + transformationID);
                        } 
                        if (axis == 'x') transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, [1, 0, 0]);
                        if (axis == 'y') transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, [0, 1, 0]);
                        if (axis == 'z') transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, [0, 0, 1]);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <animations> block
     * @param {animations block element} animationsNode 
     */
    parseAnimations(animationsNode) {
        var children = animationsNode.children;

        this.animations = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of animations
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "animation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current animation.
            var animationId = this.reader.getString(children[i], 'id');
            if (animationId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.animations[animationId] != null)
                return "ID must be unique for each animation (conflict: ID = " + primitiveId + ")";

            // keyframes inside animation i
            grandChildren = children[i].children;

            // loop through the keyframes
            var keyframesCounter = 0;
            var keyframes = [];
            for (var j = 0; j < grandChildren.length; j++) {
                if(grandChildren[j].nodeName != 'keyframe') {
                    this.onXMLMinorError("child of animation for ID " + animationId + " must be a keyframe");
                    continue;
                }

                var instant = this.reader.getFloat(grandChildren[j], 'instant');
                if(!(instant != null && !isNaN(instant) && instant >= 0)) {
                    this.onXMLMinorError('instant value of animation for ID ' + animationId + 'cannot be negative');
                }

                //inside keyframe
                grandgrandChildren = grandChildren[j].children;

                nodeNames = [];
                for (var k = 0; k < grandgrandChildren.length; k++) {
                    nodeNames.push(grandgrandChildren[k].nodeName);
                }

                var translateIndex = nodeNames.indexOf("translate");
                var rotateIndex = nodeNames.indexOf("rotate");
                var scaleIndex = nodeNames.indexOf("scale");

                if (translateIndex != 0 || rotateIndex != 1 || scaleIndex != 2) {
                    this.onXMLMinorError("some transformations in animation for ID " + animationId + " are not in the right order");
                }

                var translate = this.parseCoordinates3D(grandgrandChildren[translateIndex], 'translate transformation of animation for ID ' + animationId);
                if(!Array.isArray(translate)) {
                    return translate;
                }

                var scale = this.parseCoordinates3D(grandgrandChildren[scaleIndex], 'scale transformation in animation for ID ' + animationId);
                if(!Array.isArray(scale)) {
                    return scale;
                }

                // angle_x
                var rotateX = this.reader.getFloat(grandgrandChildren[rotateIndex], 'angle_x');
                if (!(rotateX != null && !isNaN(rotateX))) {
                    this.onXMLMinorError('unable to parse angle_x of animation for ID ' + animationId);
                }

                // angle_y
                var rotateY = this.reader.getFloat(grandgrandChildren[rotateIndex], 'angle_y');
                if (!(rotateY != null && !isNaN(rotateY))) {
                    this.onXMLMinorError('unable to parse angle_y of animation for ID ' + animationId);
                }

                // angle_z
                var rotateZ = this.reader.getFloat(grandgrandChildren[rotateIndex], 'angle_z');
                if (!(rotateZ != null && !isNaN(rotateZ))) {
                    this.onXMLMinorError('unable to parse angle_z of animation for ID ' + animationId);
                }

                var keyframe = new MyKeyframe(instant, translate, [rotateX, rotateY, rotateZ], scale);
            
                keyframes.push(keyframe);

                keyframesCounter++;
            }

            if(keyframesCounter == 0) {
                this.onXMLMinorError("Should exist at least one keyframe in animation for ID " + animationId);
            }
            
            // sort accordingly to time
            keyframes.sort(function(a, b) {
                return a.instant - b.instant;
            });
            var anim = new MyKeyframeAnimation(keyframes);
            this.animations[animationId] = anim;
        }
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'plane' &&
                    grandChildren[0].nodeName != 'patch' && grandChildren[0].nodeName != 'cylinder2')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus, plane, patch or cylinder2)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'cylinder') {
                var base = this.reader.getFloat(grandChildren[0], "base");
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                var top = this.reader.getFloat(grandChildren[0], "top");
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                var stacks = this.reader.getFloat(grandChildren[0], "stacks");
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;


                var slices = this.reader.getFloat(grandChildren[0], "slices");
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                var height = this.reader.getFloat(grandChildren[0], "height");
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder(this.scene, slices, height, top, base, stacks);

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'triangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // z1
                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // z2
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;

                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // z3
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var triangle = new MyTriangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);

                this.primitives[primitiveId] = triangle;
            }
            else if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'torus') {
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var torus = new MyTorus(this.scene, inner, outer, slices, loops);
                this.primitives[primitiveId] = torus;
            }
            else if (primitiveType == 'plane') {
                //npartsU
                var npartsU = this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU)))
                    return "unable to parse npartsU of the primitive coordinates for ID = " + primitiveId;

                //npartsV
                var npartsV = this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV)))
                    return "unable to parse npartsV of the primitive coordinates for ID = " + primitiveId;

                var plane = new MyPlane(this.scene, npartsU, npartsV);
                this.primitives[primitiveId] = plane;
            }
            else if (primitiveType == 'patch') {
                //npointsU
                var npointsU = this.reader.getFloat(grandChildren[0], 'npointsU');
                if (!(npointsU != null && !isNaN(npointsU)))
                    return "unable to parse npointsU of the primitive coordinates for ID = " + primitiveId;

                //npointsV
                var npointsV = this.reader.getFloat(grandChildren[0], 'npointsV');
                if (!(npointsV != null && !isNaN(npointsV)))
                    return "unable to parse npointsV of the primitive coordinates for ID = " + primitiveId;

                //npartsU
                var npartsU = this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU)))
                    return "unable to parse npartsU of the primitive coordinates for ID = " + primitiveId;

                //npartsV
                var npartsV = this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV)))
                    return "unable to parse npartsV of the primitive coordinates for ID = " + primitiveId;

                var grandgrandChildren = grandChildren[0].children;
            
                var controlpoints = [];
                if(grandgrandChildren.length != ((npointsU+1) * (npointsV+1))) {
                    return "Invalid number of control points of the primitive for ID = " + primitiveId;
                }
                else {

                    for (var u = 0; u < (npointsU +1); u++) {
                        var ucontrolpoints = [];
                        for(var v = 0; v < (npointsV + 1); v++) {
                            var x = this.reader.getFloat(grandgrandChildren[u*(npointsV+1) + v], 'xx');
                            if (!(x != null && !isNaN(x)))
                                return "unable to parse xx in controlpoint of the primitive coordinates for ID = " + primitiveId;

                            var y = this.reader.getFloat(grandgrandChildren[u*(npointsV+1) + v], 'yy');
                            if (!(y != null && !isNaN(y)))
                                return "unable to parse yy in controlpoint of the primitive coordinates for ID = " + primitiveId;
    
                            var z = this.reader.getFloat(grandgrandChildren[u*(npointsV+1) + v], 'zz');
                            if (!(z != null && !isNaN(z)))
                                return "unable to parse zz in controlpoint of the primitive coordinates for ID = " + primitiveId;

                            ucontrolpoints.push([x, y, z, 1]);
                        }
                        controlpoints.push(ucontrolpoints);
                    }
                }
                var patch = new MyPatch(this.scene, npointsU, npointsV, npartsU, npartsV, controlpoints);
                this.primitives[primitiveId] = patch;
            }
            else if (primitiveType == 'cylinder2') {
                var base = this.reader.getFloat(grandChildren[0], "base");
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                var top = this.reader.getFloat(grandChildren[0], "top");
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                var stacks = this.reader.getFloat(grandChildren[0], "stacks");
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;


                var slices = this.reader.getFloat(grandChildren[0], "slices");
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                var height = this.reader.getFloat(grandChildren[0], "height");
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder2(this.scene, slices, height, top, base, stacks);

                this.primitives[primitiveId] = cylinder;
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            // Check is particular theme
            var theme = this.reader.getString(children[i], 'theme');
            if (theme != null && this.scene.themes.indexOf(theme) == -1) {
                this.scene.themes.push(theme);
            }

            grandChildren = children[i].children;

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            let transformationIndex = nodeNames.indexOf("transformation");
            let animationIndex = nodeNames.indexOf("animationref");
            let materialsIndex = nodeNames.indexOf("materials");
            let textureIndex = nodeNames.indexOf("textures");
            let childrenIndex = nodeNames.indexOf("children");

            let transformation = null;
            let animation = null;
            let materialIds = [];
            let textureIds = [];
            let childrenIds = [];
            let primitiveIds = [];            

            // Transformations
            if(transformationIndex == -1) 
                this.onXMLMinorError("transformation is not defined in component for ID " + componentID);

            grandgrandChildren = grandChildren[transformationIndex].children;

            let transfMatrix = mat4.create();
            for (let j = 0; j < grandgrandChildren.length; j++) {

                // transformation reference
                if (grandgrandChildren[j].nodeName == "transformationref") {

                    // Get id of teh current transformation.
                    var transformationId = this.reader.getString(grandgrandChildren[j], 'id');
                    if (transformationId == null)
                        return "no ID defined for transformation in component for ID " + componentID;

                    // Check if ID exists in this.transformations
                    if (this.transformations[transformationId] == null)
                        return "ID must have been defined in block transformation";

                    transfMatrix = mat4.multiply(transfMatrix, transfMatrix, this.transformations[transformationId]);
                }

                // translate
                if (grandgrandChildren[j].nodeName == 'translate') {

                    var translate = this.parseCoordinates3D(grandgrandChildren[j], "translate transformation of component for ID " + componentID);
                    if (!Array.isArray(translate))
                        return translate;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, translate);
                }

                // scale
                if (grandgrandChildren[j].nodeName == 'scale') {

                    var scale = this.parseCoordinates3D(grandgrandChildren[j], "scale transformation of component for ID " + componentID);
                    if (!Array.isArray(scale))
                        return scale;

                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, scale);
                }

                // rotate
                if (grandgrandChildren[j].nodeName == 'rotate') {
                    // angle
                    var angle = this.reader.getFloat(grandgrandChildren[j], "angle");
                    if (!(angle != null && !isNaN(angle))) {
                        this.onXMLMinorError("unable to parse angle of transformation rotate in component for ID " + componentID);
                    }
                    //axis
                    let axis = this.reader.getString(grandgrandChildren[j], "axis");
                    if (!(axis != null))
                        this.onXMLMinorError("unable to parse axis of transformation rotate in component for ID " + componentID);

                    if  (axis == 'x') transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, [1, 0, 0]);
                    if  (axis == 'y') transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, [0, 1, 0]);
                    if  (axis == 'z') transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, [0, 0, 1]);
                }
            }
            transformation = transfMatrix;

            // Animation
            if (animationIndex != -1) {
                // Get id of the current animation.
                let animationId = this.reader.getString(grandChildren[animationIndex], 'id');
                if (animationId == null)
                    return "no ID defined for animation in component for ID " + componentID;

                // Check if ID exists in this.animation
                if (this.animations[animationId] == null)
                    return "ID must have been defined in block animation (component ID " + componentID + ")";

                animation = this.animations[animationId];
            }


            // Materials
            if(materialsIndex == -1) 
                this.onXMLMinorError("materials is not defined in component for ID " + componentID);

            grandgrandChildren = grandChildren[materialsIndex].children;
            let materialCounter = 0;

            for (let j = 0; j < grandgrandChildren.length; j++) {
                
                // material reference
                if (grandgrandChildren[j].nodeName == "material") {

                    // Get id of the current material.
                    let materialId = this.reader.getString(grandgrandChildren[j], 'id');
                    if (materialId == null)
                        return "no ID defined for material in component for ID " + componentID;

                    // Check if material is not inherit or ID dont exists in this.materials
                    if(materialId != "inherit" && this.materials[materialId] == null)
                        return "ID must have been defined in block material (component ID " + componentID + ")";

                    materialIds.push(materialId);
                    materialCounter++;
                }
                else this.onXMLMinorError("Node name should be material in component for ID " + componentID);
            }

            if(!materialCounter)
                this.onXMLMinorError("At least one material must be defined in component for ID " + componentID);

            // Texture
            if(textureIndex == -1) 
                this.onXMLMinorError("textures is not defined in component for ID " + componentID);

            grandgrandChildren = grandChildren[textureIndex].children;
            let textureCounter = 0;
            let lengthS = [];
            let lengthT = [];

            for (let j = 0; j < grandgrandChildren.length; j++) {
                if (grandgrandChildren[j].nodeName == "texture") {
                    // Get id of the current texture.
                    let textureId = this.reader.getString(grandgrandChildren[j], 'id');
                    if (textureId == null)
                        return "no ID defined for texture in component for ID " + componentID;

                    // Check if ID exists in this.texture
                    if (textureId != 'none' && textureId != 'inherit' && this.textures[textureId] == null)
                        return "ID must have been defined in block texture (component ID " + componentID + ")";

                    let theme = this.reader.getString(grandgrandChildren[j], 'theme');
                    if (theme == null) {
                        return "no theme defined for texture in component for ID " + componentID;
                    }

                    if (this.scene.themes.indexOf(theme) == -1) {
                        this.scene.themes.push(theme);
                    }

                    let length_s = null, length_t = null;

                    if (textureId != 'none' && textureId != 'inherit') {
                        // length_s
                        length_s = this.reader.getFloat(grandgrandChildren[j], 'length_s');
                        if (!(length_s != null && !isNaN(length_s)))
                            this.onXMLError("unable to parse length_s of texture in component for ID " + componentID);

                        // length_t
                        length_t = this.reader.getFloat(grandgrandChildren[j], 'length_t');
                        if (!(length_t != null && !isNaN(length_t)))
                            this.onXMLError("unable to parse length_t of texture in component for ID " + componentID);
                    }

                    textureCounter++;
                    textureIds[theme] = textureId;
                    lengthS[theme] = length_s;
                    lengthT[theme] = length_t;
                }
                else this.onXMLMinorError("Node name should be texture in component for ID " + componentID);
            }

            if(!textureCounter) 
                this.onXMLMinorError("At least one texture must be defined in component for ID " + componentID);
            

            // Children
            if(childrenIndex == -1) 
                this.onXMLMinorError("children is not defined in component for ID " + componentID);

            grandgrandChildren = grandChildren[childrenIndex].children;

            for (var j = 0; j < grandgrandChildren.length; j++) {
                // children reference
                if (grandgrandChildren[j].nodeName == "componentref") {

                    // Get id of the current children.
                    var childId = this.reader.getString(grandgrandChildren[j], 'id');
                    if (childId == null)
                        return "no ID defined for child in component for ID " + componentID;

                    childrenIds.push(childId);
                }
                // primitive reference
                if (grandgrandChildren[j].nodeName == "primitiveref") {

                    // Get id of the current primitive
                    var primitiveId = this.reader.getString(grandgrandChildren[j], 'id');
                    if (primitiveId  == null)
                        return "no ID defined for primitive in component for ID " + componentID;

                    // check if id exists in this.primitives
                    if (this.primitives[primitiveId] == null) 
                        return "ID must have been defined in block primitives";

                    primitiveIds.push(primitiveId);
                }
            }
            var comp = new MyComponent(componentID, theme, transformation, animation, materialIds, textureIds, lengthS, lengthS, childrenIds, primitiveIds);
            this.components[componentID] = comp;

            // check if it is one black or white piece 
            if (componentID.indexOf("piece") != -1 && componentID.indexOf("white") != -1) {
                let piece = new MyPiece(componentID, translate[2], translate[0], 'white', mat4.copy(mat4.create(), transformation));
                this.scene.pieces.push(piece);
            }
            else if (componentID.indexOf("piece") != -1 && componentID.indexOf("black") != -1) {
                let piece = new MyPiece(componentID, translate[2], translate[0], 'black', mat4.copy(mat4.create(), transformation));
                this.scene.pieces.push(piece);                             
            }
        }
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Callback to be executed on periodic events
     * @param {int} sceneTime in ms 
     */
    update(sceneTime) {        
        for (var key in this.components) {
            this.components[key].update(sceneTime);
        }
    }


    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene(theme) {
        var matID = Object.keys(this.materials)[0];
        this.processNode(this.idRoot, this.materials[matID], null, 1, 1, false, theme);
    }

    /**
     * Processes the node, applying the material and texture, if defined
     * and recursively calling the processNode of the children
     * or displayPrimitive of primitives
     * @param {string} id
     * @param {CGFappearance} mat
     * @param {CGFtexture} text
     * @param {float} sLength
     * @param {float} tLength
     */
    processNode(id, mat, text, lengthS, lengthT, picked, theme) {
        let component = this.components[id];
        if(component == null) {
            this.onXMLError("component for ID " + id + " doesn't exist!");
            return;
        }

        if (component.theme != null && component.theme != theme) {
            return;
        }

        if (picked) {

        }
        else if (id.indexOf("cell") != -1) {
            let n = parseInt(id[4] + id[5]);
            this.scene.registerForPick(n, component);
            picked = true;
        }
        else if (id.indexOf("piece_white") != -1 || id.indexOf("piece_black") != -1) {
            if (this.scene.gameboard != null) {
                let n = this.scene.gameboard.findPosOfPieceID(id); 
                this.scene.registerForPick(n+11, component);
                picked = true;
            }
        }
        else if (!picked) {
            this.scene.registerForPick(0, null);
        }

        // if material not inherit, defines new material
        if (component.materialIDs[component.materialIndex] != 'inherit') {
            mat = this.materials[component.materialIDs[component.materialIndex]];
        }
            
        let compTexID = component.chooseTexture(theme);

        // if texture not 'inherit' or 'none'
        if (compTexID != 'inherit' && compTexID != 'none')
            text = this.textures[compTexID];

        // if 'none'
        else if (component.textureID == 'none')
            text = null;

        let compLenS = component.chooseLengthS(theme);
        let compLenT = component.chooseLengthT(theme);

        // lengthS and lengthT
        if (compLenS != null && compLenT != null){
            lengthS = compLenS;
            lengthT = compLenT; 
        }

        mat.apply();
        mat.setTexture(text);

        this.scene.pushMatrix();

        this.scene.multMatrix(component.transformation);

        if(component.animMatrix != null) {
            this.scene.multMatrix(component.animMatrix);
        }

        for (let i = 0; i < component.primitiveID.length; i++) {
            this.displayPrimitive(component.primitiveID[i], mat, text, lengthS, lengthT);
        }

        for (let i = 0; i < component.childrenID.length; i++) {
            this.processNode(component.childrenID[i], mat, text, lengthS, lengthT, picked, theme);
        }

        this.scene.popMatrix();
    }

    /**
    * displays the primitiveID received, applying lengthS and lengthT to its texture
    * @param {string} id
    * @param {float} lengthS 
    * @param {float} lengthT
    */
   displayPrimitive(id, mat, text, lengthS, lengthT) {
        let primitive = this.primitives[id];
        mat.apply();
        mat.setTexture(text);
        primitive.applyTextures(lengthS, lengthT);
        primitive.display();
   }

   /**
    * loops through all components to increment the materialIndex of each 
    */
   nextMaterial() {
       for (let key in this.components) {
           this.components[key].nextMaterial();
       }
   }
}

