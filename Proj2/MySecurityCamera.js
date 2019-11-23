class MySecurityCamera extends CGFobject {

    constructor(scene, RTTexture, id) {
        super(scene);

        this.id = id;        
        this.scene = scene;
        this.shader = new CGFshader(scene.gl, "shaders/shader.vert", "shaders/shader.frag");
        this.rectangle = new MyRectangle(scene, id, 0,1,0,1);
        this.RTTexture = RTTexture;
    }

    display() {
        this.scene.setActiveShader(this.shader);
        this.RTTexture.bind(0);
        this.rectangle.display();

    }



}