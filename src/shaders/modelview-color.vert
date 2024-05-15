#version 300 es

uniform mat4 mvp;

in vec4 position;
in vec4 color;

out vec4 vColor;
out vec3 vNormal;

void main() {
    gl_Position = mvp * position;
    vColor = color;
}
