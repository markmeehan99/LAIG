/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    addViews(views) {
        var viewGroup = this.gui.addFolder("Views");
        // viewGroup.open();

        var cameraIdArray = Object.keys(views);
        this.currentCameraId = this.scene.graph.defaultView;

        this.displaySecurityCam = this.scene.graph.displaySecurityCam;
        var displaySecCam = this.scene.displaySecCam;

        viewGroup.add(this, 'currentCameraId', cameraIdArray).name('Camera').onChange(val => this.scene.selectView(val));
        viewGroup.add(this, 'currentCameraId', cameraIdArray).name('Security Camera').onChange(val => this.scene.selectSecView(val));

        this.gui.add(this.scene.displaySecCam, 'Display Security Camera')    }


    addLights(lights) {

        var lightGroup = this.gui.addFolder("Lights");
        // lightGroup.open();

        // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
        // e.g. this.option1=true; this.option2=false;

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                this.scene.lightValues[key] = lights[key][0];
                lightGroup.add(this.scene.lightValues, key);
            }
        }
    }

    addThemes(themes, scene) {
        var themeGroup = this.gui.addFolder("Theme");
        themeGroup.open();

        themeGroup.add(scene, 'selectedTheme', themes);
    }

    addGameInterface(scene, gameMode) {
        var gameGroup = this.gui.addFolder("Game");
        gameGroup.open();
        gameGroup.add(scene, 'undo');
        
        var mode = this.gui.addFolder("Game Mode");
        mode.open();
        mode.add(scene, 'selectedMode', gameMode);
        mode.add(scene, 'start_game');
        
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
        if(event.code ==  'KeyM') {
            this.scene.nextMaterial();
        }
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}