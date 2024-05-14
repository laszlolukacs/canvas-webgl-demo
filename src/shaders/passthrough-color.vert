#version 300 es

in vec4 position;
in vec4 color;

uniform mat4 camera;
out vec4 vColor;

void main() {
    gl_Position = camera * position;
    vColor = color;
}
