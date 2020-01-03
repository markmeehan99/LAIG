var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.lightValues = {};
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.textureRTT = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);

        this.secCam = new MySecurityCamera(this, this.textureRTT, 0);

        this.sceneInited = false;

        this.defaultShader = this.activeShader;
        this.transparencyShader=new CGFshader(this.gl, "shaders/scale.vert", "shaders/transparency.frag");


        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(16.67);
        this.startingTime = null;

        this.setPickEnabled(true);
        this.pickedCells = [];

        this.gameboard = new MyGameBoard(this);
        this.allowBotMove = 0;

        this.themes = ['default'];

        this.displaySecCam = {
            'Display Security Camera': true
        }
    
        this.selectedTheme = 'game';

        this.cameraAnimation = false;
        this.cameraAnimationAngle = 0;
        this.cameraAnimationTimeStarted = null;
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera1 = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.camera2 = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                this.lights[i].setConstantAttenuation(light[6]);
                this.lights[i].setLinearAttenuation(light[7]);
                this.lights[i].setQuadraticAttenuation(light[8]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[9]);
                    this.lights[i].setSpotExponent(light[10]);
                    this.lights[i].setSpotDirection(light[11][0], light[11][1], light[11][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }

    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.interface.initKeys();

        this.interface.addLights(this.graph.lights);
        this.interface.addViews(this.graph.views);
        this.interface.addThemes(this.themes, this);

        this.initDefaultView();

        this.sceneInited = true;
    }

    initDefaultView() {
        this.camera1 = this.graph.views[this.graph.defaultView];
        this.camera2 = this.graph.secCams[this.graph.defaultView];
        this.interface.setActiveCamera(this.camera);
    }

    selectView(id){
        this.camera1 = this.graph.views[id];
        // this.camera2 = this.graph.views[id];
        // this.interface.setActiveCamera(this.camera);
    }

    selectSecView(id){
        this.camera2 = this.graph.secCams[id];
        // this.camera2 = this.graph.views[id];
        // this.interface.setActiveCamera(this.camera2);
    }

    rotateCam() {
        this.cameraAnimation = true;
        this.cameraAnimationAngle = 0;
    }

    updateCameraAnimation(currTime) {
        if (this.cameraAnimation) {
            if ( this.cameraAnimationAngle == 0) {
                this.cameraAnimationAngle += 0.000001;
                this.cameraAnimationLastTime = currTime;
                return;
            }

            // managing times
            let deltaT = currTime - this.cameraAnimationLastTime;
            this.cameraAnimationLastTime = currTime;

            // this update angle
            let angle = Math.PI * deltaT / 1000;

            this.cameraAnimationAngle += angle;

            // bigger than PI
            if (this.cameraAnimationAngle > Math.PI) {
                let excess = this.cameraAnimationAngle - Math.PI;
                angle -= excess;
                this.cameraAnimation = false;
            }

            this.camera1.orbit([0,1,0], angle);
        }
    }

    update(currTime) {
        if(this.startingTime == null) {
            this.startingTime = currTime;
        }

        var sceneTime = currTime - this.startingTime;

        this.graph.update(sceneTime);
        this.secCam.shader.setUniformsValues({ timeFactor: currTime / 100 % 1000 });

        this.updateCameraAnimation(currTime);
    }

    logPicking() {
        if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i = 0; i < this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj) {
                        var customId = this.pickResults[i][1];
                        this.pickedCells.push(customId);
                        if (this.pickedCells.length == 2) {
                            var player = this.gameboard.getPlayer();
                            console.log('Its this players turn: ' + player);

                            this.gameboard.movePlayer(this.pickedCells[0], this.pickedCells[1], player);

                            console.log('State after move:');
                            console.log(this.gameboard.currentState);
                            this.pickedCells = [];
                        }
						// console.log("Picked object: " + obj + ", with pick id " + customId);						
					}
				}
				this.pickResults.splice(0, this.pickResults.length);
			}
		}
    }

    display() {
        if (this.gameboard.currentState == 0) {
            document.getElementById("player").innerText = "Currently establishing connection to server...\n";
        } else if (this.gameboard.currentState > 0) {
            document.getElementById("player").innerText = "Player: " + this.gameboard.getPlayer() + "\n";
            document.getElementById("score").innerText = "Score: \n" + this.gameboard.getScore() + "\n";
            // document.getElementById("time").innerText = "Game Time: " + this.gameboard.getGameTime() + "\n";
        }

        this.textureRTT.attachToFrameBuffer();
        this.render(this.camera2);
        this.textureRTT.detachFromFrameBuffer();
        this.render(this.camera1);

        this.gl.disable(this.gl.DEPTH_TEST);

        if (this.displaySecCam['Display Security Camera']) {
            this.secCam.display();
        }
        
        this.setActiveShader(this.transparencyShader);

        this.setActiveShader(this.defaultShader);
        
        this.gl.enable(this.gl.DEPTH_TEST);
        
        

    }

    /**
     * Displays the scene.
     */
    render(camera) {

        // picking handling
        
        if (this.gameboard.currentMode == this.gameboard.mode.PLAYER_VS_PLAYER  && this.gameboard.currentState > 0 ) {
            this.logPicking();
        } else if (this.gameboard.currentMode == this.gameboard.mode.BOT_VS_BOT && this.gameboard.currentState > 0 ) {
            if (!this.gameboard.botStarted) this.gameboard.allowBot();  
        } else if (this.gameboard.currentMode == this.gameboard.mode.PLAYER_VS_BOT && this.gameboard.currentState > 0 ) {
            if (this.gameboard.currentState == 1 || this.gameboard.currentState == 2) {
                // console.log('Waiting for player move');
                this.logPicking();
            } else if (this.gameboard.currentState == 3 || this.gameboard.currentState == 4) {
                // console.log('Generating bot move');
                if (!this.gameboard.botMoveMade) this.gameboard.oneBotMove();
            }
        }
     

        this.clearPickRegistration();

        // ---- BEGIN Bglackground, camera and axis setup
        
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.camera = camera;

        this.interface.setActiveCamera(this.camera);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        // Draw axis
        this.axis.display();

        if (this.sceneInited) {

            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene(this.selectedTheme);
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    /**
     * call for next material in this.graph
     */
    nextMaterial() {
        this.graph.nextMaterial();
    }
}