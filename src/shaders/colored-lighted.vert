#version 300 es

uniform mat4 mvp;
uniform mat4 model;

in vec4 position;
in vec4 color;
in vec4 normal;

out vec3 vPosition;
out vec4 vColor;
out vec3 vNormal;

void main() {
    gl_Position = mvp * position;

    vPosition = vec3(model * position);
    vColor = color;

    mat4 inverseTranspose = transpose(inverse(model));
    vNormal = normalize(vec3(inverseTranspose * normal));
}
