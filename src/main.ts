import vertexShaderSource from './shaders/passthrough-color.vert?raw';
import fragmentShaderSource from './shaders/passthrough-color.frag?raw';

main();

function main() {
  const glcanvas = document.getElementById("glcanvas") as HTMLCanvasElement;
  if (glcanvas != null) {
    const gl = glcanvas.getContext("webgl2");
    if (gl == null) {
      return;
    }

    // vector layout: [posX, posY, posZ, colorR, colorG, colorB]
    const vertices = new Float32Array([
      0.0, 0.5, 0.0, 0.0, 1.0, 0.0, // point 1
      -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, // point 2
      0.5, -0.5, 0.0, 1.0, 0.0, 0.0  // point 3
    ]);

    setupBuffers(gl, vertices);
    const FLOAT_BYTES = vertices.BYTES_PER_ELEMENT;

    let glProgram = compileShaders(gl, vertexShaderSource, fragmentShaderSource);
    if (glProgram == null) {
      return;
    }

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
    gl.drawArrays(
      gl.TRIANGLES, // mode
      0,            // start
      3             // count
    );
  }
}

function setupBuffers(gl: Readonly<WebGL2RenderingContext>, vertices: Float32Array) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function compileShaders(gl: Readonly<WebGL2RenderingContext>, vertSrc: string, fragSrc: string): WebGLProgram | null {
  if (gl === null
    || vertSrc === null
    || fragSrc === null
  ) {
    return null;
  }

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
