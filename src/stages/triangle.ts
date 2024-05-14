
main();

function main() {
  // we need a canvas first
  const glcanvas = document.getElementById("glcanvas") as HTMLCanvasElement;
  if (glcanvas != null) {
    const gl = glcanvas.getContext("webgl2");
    if (gl == null) {
      return;
    }

    // specify the position of the vertices
    var vertices = new Float32Array([
      0.0, 0.5, 0.0, // point 1
      -0.5, -0.5, 0.0, // point 2
      0.5, -0.5, 0.0  // point 3
    ]);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vertexShaderSource = `
    attribute vec4 position;
    void main() {
      gl_Position = position;
    }`;

    const fragmentShaderSource = `
    precision highp float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`;

    let glProgram = compileShaders(gl, vertexShaderSource, fragmentShaderSource);
    if (glProgram == null) {
      return;
    }

    let position = gl.getAttribLocation(glProgram, "position");
    gl.vertexAttrib4f(position, 0.0, 0.0, 0.0, 1.0);

    let color = gl.getUniformLocation(glProgram, "color");
    gl.uniform4f(color, 1.0, 0.0, 0.0, 1.0);

    // bind the [posX, posY, posZ] to the 'position' shader attribute
    gl.vertexAttribPointer(
      position,         // shader attribute pointer
      3,                // length
      gl.FLOAT,         // type
      false,            // normalize
      0,                // stride
      0                 // offset
    );
    gl.enableVertexAttribArray(position);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render
    gl.drawArrays(
      gl.TRIANGLES, // mode
      0,            // start
      3             // count
    );
  }
}

function compileShaders(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
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
