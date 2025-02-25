/*
 * See LICENSE for details.
 */

main();

function main() {
  const glcanvas = document.getElementById("glcanvas") as HTMLCanvasElement;
  if (glcanvas == null) {
    console.error("HTML Canvas element was not found");
    return;
  }

  const gl = glcanvas.getContext("webgl2");
  if (gl == null) {
    console.error("Unable to create WebGL2 context");
    return;
  }

  const vertexShaderSource = `#version 300 es
  in vec4 position;
  in vec4 color;
  out vec4 vColor;
  void main() {
    gl_Position = position;
    vColor = color;
  }`;

  const fragmentShaderSource = `#version 300 es
  precision highp float;
  in vec4 vColor;
  out vec4 fragColor;
  void main() {
  fragColor = vColor;
  }`;

  let glProgram = compileShaders(gl, vertexShaderSource, fragmentShaderSource);
  if (glProgram == null) {
    console.error("Error during shader compilation, see the logs above");
    return;
  }

  // vector layout: [posX, posY, posZ, colorR, colorG, colorB]
  const vertices = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0 white
    -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,  // v1 magenta
    -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  // v2 red
    1.0, -1.0, 1.0, 1.0, 1.0, 0.0,  // v3 yellow
    1.0, -1.0, -1.0, 0.0, 1.0, 0.0,  // v4 green
    1.0, 1.0, -1.0, 0.0, 1.0, 1.0,  // v5 cyan
    -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,  // v6 blue
    -1.0, -1.0, -1.0, 0.0, 0.0, 0.0   // v7 black
  ]);

  const cubeIndices = new Uint8Array([
    0, 1, 2, 0, 2, 3,
    0, 3, 4, 0, 4, 5,
    0, 5, 6, 0, 6, 1,
    1, 6, 7, 1, 7, 2,
    7, 4, 3, 7, 3, 2,
    4, 7, 6, 4, 6, 5
  ]);

  setupBuffers(gl, vertices, cubeIndices);

  const FLOAT_BYTES = vertices.BYTES_PER_ELEMENT;

  // bind the [posX, posY, posZ] to the 'position' shader attribute
  let position = gl.getAttribLocation(glProgram, "position");
  gl.vertexAttribPointer(
    position,         // shader attribute pointer
    3,                // length
    gl.FLOAT,         // type
    false,            // normalize
    FLOAT_BYTES * 6,  // stride (length of one section of the vector)
    0                 // offset (starting position of this attribute in the vector section)
  );
  gl.enableVertexAttribArray(position);

  // bind the [colorR, colorG, colorB] to the 'color' shader attribute
  let color = gl.getAttribLocation(glProgram, "color");
  gl.vertexAttribPointer(
    color,            // shader attribute pointer
    3,                // length
    gl.FLOAT,         // type
    false,            // normalize
    FLOAT_BYTES * 6,  // stride (length of one section of the vector)
    FLOAT_BYTES * 3   // offset (starting position of this attribute in the vector section)
  );
  gl.enableVertexAttribArray(color);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // the actual rendering
  gl.drawElements(
    gl.TRIANGLES,
    36,
    gl.UNSIGNED_BYTE,
    0
  );
}

function setupBuffers(gl: Readonly<WebGL2RenderingContext>, vertices: Float32Array, cubeIndices: Uint8Array) {
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
}

function compileShaders(gl: Readonly<WebGL2RenderingContext>, vertSrc: string, fragSrc: string): WebGLProgram | null {
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (vertexShader == null) {
    return null;
  }

  gl.shaderSource(vertexShader, vertSrc);
  gl.compileShader(vertexShader);

  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (fragmentShader == null) {
    return null;
  }

  gl.shaderSource(fragmentShader, fragSrc);
  gl.compileShader(fragmentShader);

  let glProgram = gl.createProgram();
  if (glProgram == null) {
    return null;
  }

  gl.attachShader(glProgram, vertexShader);
  gl.attachShader(glProgram, fragmentShader);
  gl.linkProgram(glProgram);
  gl.useProgram(glProgram);

  console.log('Vertex shader:', gl.getShaderInfoLog(vertexShader) || 'OK');
  console.log('Fragment shader:', gl.getShaderInfoLog(fragmentShader) || 'OK');

  return glProgram;
}
