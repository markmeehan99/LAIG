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

        this.pieces = [];
        this.pieceComponents = [];

        this.defaultShader = this.activeShader;


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

        // this.gameboard = new MyGameBoard(this);
        this.allowBotMove = 0;

        
        this.displaySecCam = {
            'Display Security Camera': false
        }
        
        this.themes = ['default'];
        this.selectedTheme = 'game';

        this.gameMode = ['player_vs_player', 'player_vs_bot', 'bot_vs_bot'];
        this.selectedMode = null;

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
        this.interface.addGameInterface(this, this.gameMode);

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
        var player = this.gameboard.getPlayer();
        // if (player == "white") this.gameboard.resetTimer();
        // else if (player == "black") this.gameboard.resetTimer();
    }

    updateCameraAnimation(currTime) {
        if (this.cameraAnimation) {
            // first update iteration
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
        else if (this.gameboard == null) {
            if ( this.cameraAnimationLastTime == null) {
                this.cameraAnimationLastTime = currTime;
                return;
            }

            // managing times
            let deltaT = currTime - this.cameraAnimationLastTime;
            this.cameraAnimationLastTime = currTime;

            // this update angle
            let angle = Math.PI * deltaT / 15000;

            this.cameraAnimationAngle += angle;

            this.camera1.orbit([0,0,1], angle);
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
                            
                            this.gameboard.stopCounter();
                            this.gameboard.resetTimer();

                            this.gameboard.movePlayer(this.pickedCells[0], this.pickedCells[1], player);
                            this.pickedCells = [];
                        }
						console.log("Picked object: " + obj + ", with pick id " + customId);						
					}
				}
				this.pickResults.splice(0, this.pickResults.length);
			}
		}
    }

    display() {

        if (this.gameboard == null) {
            document.getElementById("player").innerText = "Waiting for game to start...";
        }

        if (this.gameboard != null) {
            if (this.gameboard.currentState == 0) {
                document.getElementById("player").innerText = "Currently establishing connection to server...\n";
            } else if (this.gameboard.currentState > 0) {
                document.getElementById("player").innerText = "Player: " + this.gameboard.getPlayer() + "\n";
                document.getElementById("score").innerText = this.gameboard.getScore() + "\n";
                if (this.gameboard.currentMode == 0) {
                    
                    if (this.gameboard.getPlayer() == 'white') {
                        document.getElementById("time").innerText = "Time to play: " + this.gameboard.playTime + "\n";
                        if (this.gameboard.playTime < 4) document.getElementById("time").style.color = 'red';
                        else document.getElementById("time").style.color = 'white';
                    
                        
                        if (this.gameboard.playerWhite.getPlayTime() <= 3)
                            document.getElementById("time").style.color="red";
                    }
                    else if (this.gameboard.getPlayer() == 'black') {
                        document.getElementById("time").innerText = "Time to play: " + this.gameboard.playTime + "\n";

                        if (this.gameboard.playTime < 4) document.getElementById("time").style.color = 'red';
                        else document.getElementById("time").style.color = 'white';
                    }
                }
            }
        }

        this.textureRTT.attachToFrameBuffer();
        this.render(this.camera2);
        this.textureRTT.detachFromFrameBuffer();
        this.render(this.camera1);

        this.gl.disable(this.gl.DEPTH_TEST);

        if (this.displaySecCam['Display Security Camera']) {
            this.secCam.display();
        }
        

        this.setActiveShader(this.defaultShader);
        
        this.gl.enable(this.gl.DEPTH_TEST);
        
        

    }

    /**
     * Displays the scene.
     */
    render(camera) {

        // picking handling

        if (this.gameboard != null) {

            if (this.gameboard.currentMode == this.gameboard.mode.PLAYER_VS_PLAYER  && this.gameboard.currentState > 0 ) {
                
                var player = this.gameboard.getPlayer();
                if (player == 'white' && !this.gameboard.clockStarted) {
                    this.gameboard.stopCounter();
                    this.gameboard.startCounter();
                    this.gameboard.clockStarted = 1;
                }
                else if (player == 'black' && !this.gameboard.clockStarted) {
                    this.gameboard.stopCounter();
                    this.gameboard.startCounter();
                    this.gameboard.clockStarted = 1;
                }
                
                if (player == 'white' && this.gameboard.playerWhite.getPlayTime() == 0 && !this.gameboard.turning) {
                    this.gameboard.turning = 1;
                    this.gameboard.updateTurn();
                } else this.logPicking();
                
                if (player == 'black' && this.gameboard.playerBlack.getPlayTime() == 0) {
                    this.gameboard.updateTurn();
                } else this.logPicking();
    
            } else if (this.gameboard.currentMode == this.gameboard.mode.BOT_VS_BOT && this.gameboard.currentState > 0 ) {
                if (!this.gameboard.botStarted) this.gameboard.allowBot();  
            } else if (this.gameboard.currentMode == this.gameboard.mode.PLAYER_VS_BOT && this.gameboard.currentState > 0 ) {
                if (this.gameboard.currentState == 1 || this.gameboard.currentState == 2) {
                    this.logPicking();
                } else if (this.gameboard.currentState == 3 || this.gameboard.currentState == 4) {
                    if (!this.gameboard.botMoveMade) {
                        this.gameboard.oneBotMove();
                    }
                }
            }
         
        }
        

        this.clearPickRegistration();

        // ---- BEGIN Bglackground, camera and axis setup
        
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.camera = camera;

        //Uncomment to activate mouse camera movement
        // this.interface.setActiveCamera(this.camera);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        // Draw axis
        // this.axis.display();

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

    undo() {
        if (this.gameboard != null) this.gameboard.undo();
    }

    player_vs_player() {
        if (this.gameboard == null) {
            
        this.gameboard = new MyGameBoard(this, 0);

        this.gameboard.pieces = this.pieces;
        }
    }

    player_vs_bot() {
        if (this.gameboard == null) {
            
        this.gameboard = new MyGameBoard(this, 1);

        this.gameboard.pieces = this.pieces;
        }
    }

    bot_vs_bot() {
        if (this.gameboard == null) {
            
        this.gameboard = new MyGameBoard(this, 2);

        this.gameboard.pieces = this.pieces;
        }
    }

    resetCamera() {
        this.camera1.setPosition(this.resetCameraFrom);
        this.camera1.setTarget(this.resetCameraTo);
    }

    start_game() {
            
        if(this.gameboard != null) this.gameboard.stopBotCicle();

        this.camera1 = this.graph.views['player1'];
        this.resetCamera();

        if (this.selectedMode == 'player_vs_player') {
            this.gameboard = new MyGameBoard(this, 0);
        } else if (this.selectedMode == 'player_vs_bot') {
            this.gameboard = new MyGameBoard(this, 1);
        } else if (this.selectedMode == 'bot_vs_bot') {
            this.gameboard = new MyGameBoard(this, 2);
        }
        this.gameboard.pieces = this.pieces;
        
        this.gameboard.resetBoard();

        

    }
}