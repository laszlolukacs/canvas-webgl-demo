#version 300 es

uniform mat4 mvp;
//uniform mat4 model;

in vec4 position;
in vec4 color;

out vec4 vColor;
out vec3 vNormal;

void main() {
    //mat4 inverseTranspose = mat4(transpose(inverse(model)));
    gl_Position = mvp * position;
    vColor = color;
}
