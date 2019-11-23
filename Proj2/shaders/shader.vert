#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;


varying vec2 vTextureCoord;



void main() {
    float x_off = 0.5;
    float y_off = -1.0;
    float scale = 0.5;

	gl_Position = vec4(aVertexPosition.x * scale + x_off, aVertexPosition.y * scale + y_off, aVertexPosition.z, 1.0);
	vTextureCoord = vec2(aTextureCoord.s, 1.0 - aTextureCoord.t);
}
