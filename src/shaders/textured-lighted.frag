#version 300 es

precision highp float;

uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform vec3 ambientLight;

uniform sampler2D theSampler;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNormal;

out vec4 fragColor;

void main() {
  // Compute direction between the point light and the current fragment
  vec3 lightDirection = normalize(lightPosition - vPosition);
  
  // Compute angle between the face normal and that direction
  float nDotL = max(dot(lightDirection, vNormal), 0.0);

  vec4 surface = texture(theSampler, vTexCoord);
  
  // Compute diffuse light proportional to this angle
  vec3 diffuse = lightColor * surface.rgb * nDotL;
  
  // Compute distance from light to fragment
  float distance = length(lightPosition - vPosition);
  
  // Compute light attenuation (3.0 / distance), clamped between 0 and 1.
  // The value 3.0 is freely editable and means that anything up to 3 units away from the light is fully lighted.
  float attenuation = clamp(3.0 / distance, 0.0, 1.0);
  
  // Compute ambient light
  vec3 ambient = ambientLight * surface.rgb;
  
  fragColor = vec4(attenuation * diffuse + ambient, 1.0);;
}
