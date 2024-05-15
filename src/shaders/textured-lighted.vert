#version 300 es

uniform mat4 mvp;
uniform mat4 model;

in vec4 position;
in vec2 texCoord;
in vec4 normal;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    gl_Position = mvp * position;

    vPosition = vec3(model * position);
    vTexCoord = texCoord;

    mat4 inverseTranspose = transpose(inverse(model));
    vNormal = normalize(vec3(inverseTranspose * normal));
}
