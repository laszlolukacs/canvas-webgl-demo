import vertexShaderSource from '../shaders/textured-lighted.vert?raw';
import fragmentShaderSource from '../shaders/textured-lighted.frag?raw';
import textureUrl from '../textures/WebGL_texture.png'
import { createPerspectiveMatrix } from '../camera';

main();

function main() {
  const glcanvas = document.getElementById("glcanvas") as HTMLCanvasElement;
  if (glcanvas != null) {
    const gl = glcanvas.getContext("webgl2");
    if (gl == null) {
      return;
    }

    let glProgram = compileShaders(gl, vertexShaderSource, fragmentShaderSource);
    if (glProgram == null) {
      return;
    }

    let vertices = new Float32Array([
      1.0, 1.0, 1.0, 1.0, 1.0, //v1
      -1.0, 1.0, 1.0, 0.0, 1.0, //v2
      -1.0, -1.0, 1.0, 0.0, 0.0, //v3
      1.0, -1.0, 1.0, 1.0, 0.0, //v3 -- front

      1.0, 1.0, 1.0, 1.0, 1.0, //v5
      1.0, -1.0, 1.0, 0.0, 1.0, //v6
      1.0, -1.0, -1.0, 0.0, 0.0, //v7
      1.0, 1.0, -1.0, 1.0, 0.0, // v8 right

      1.0, 1.0, 1.0, 1.0, 1.0,  //v9
      1.0, 1.0, -1.0, 1.0, 0.0, // v10
      -1.0, 1.0, -1.0, 0.0, 0.0, //v11
      -1.0, 1.0, 1.0, 0.0, 1.0, // v12 up

      -1.0, 1.0, 1.0, 1.0, 1.0, //v13
      -1.0, 1.0, -1.0, 1.0, 0.0, //v14
      -1.0, -1.0, -1.0, 0.0, 0.0, //v15
      -1.0, -1.0, 1.0, 0.0, 1.0, // v16 left

      -1.0, -1.0, -1.0, 0.0, 0.0, //v17
       1.0, -1.0, -1.0, 1.0, 0.0, //v18
       1.0, -1.0, 1.0, 1.0, 1.0, //v19
       -1.0, -1.0, 1.0, 0.0, 1.0, //v20 down

      1.0, -1.0, -1.0, 1.0, 0.0, //v21
       -1.0, -1.0, -1.0, 0.0, 0.0, //v22
        -1.0, 1.0, -1.0, 0.0, 1.0, //v23
         1.0, 1.0, -1.0, 1.0, 1.0,  //v24 back
    ]);

    let normals = new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // front
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // right
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // up
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // left
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // down
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // back
    ]);

    let cubeNormalIndices = new Uint16Array([
      0, 1, 2, 0, 2, 3,  // front
      4, 5, 6, 4, 6, 7,  // right
      8, 9, 10, 8, 10, 11, // up
      12, 13, 14, 12, 14, 15, // left
      16, 17, 18, 16, 18, 19, // down
      20, 21, 22, 20, 22, 23  // back
    ]);

    setupBuffers(gl, glProgram, vertices, normals, cubeNormalIndices);
    loadTexture(gl, glProgram, textureUrl);

    let cameraMatrix = createPerspectiveMatrix(30.0, glcanvas.width, glcanvas.height, 0.01, 100.0);
    cameraMatrix.translateSelf(0.0, 0.0, -5.0).rotateSelf(40, 0, 0).rotateSelf(0, -45, 0);

    let model = gl.getUniformLocation(glProgram, "model");
    let mvp = gl.getUniformLocation(glProgram, "mvp");

    // Set the diffuse light color (white) and direction
    let lightColor = gl.getUniformLocation(glProgram, "lightColor");
    gl.uniform3f(lightColor, 1.0, 1.0, 1.0);
    var lightDirection = gl.getUniformLocation(glProgram, "lightPosition");
    gl.uniform3f(lightDirection, 1.4, 1.3, 1.5);

    // Set the ambient light color
    let ambientLight = gl.getUniformLocation(glProgram, "ambientLight");
    gl.uniform3f(ambientLight, 0.1, 0.1, 0.1);

    let cubeAngle = 0.0;

    gl.enable(gl.DEPTH_TEST);

    setInterval(() => {
      cubeAngle += 1.0;

      let modelMatrix = new DOMMatrix();
      modelMatrix.rotateSelf(0, cubeAngle, -cubeAngle);
      gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());

      var mvpMatrix = new DOMMatrix(modelMatrix);
      mvpMatrix.preMultiplySelf(cameraMatrix);
      gl.uniformMatrix4fv(mvp, false, mvpMatrix.toFloat32Array());

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // the actual rendering
      gl.drawElements(
        gl.TRIANGLES,
        cubeNormalIndices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    })
  }
}

function setupBuffers(gl: Readonly<WebGL2RenderingContext>, glProgram: Readonly<WebGLProgram>, vertices: Float32Array, normals: Float32Array, indices: Uint16Array) {
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const FLOAT_BYTES = vertices.BYTES_PER_ELEMENT;

  // bind the [posX, posY, posZ] to the 'position' shader attribute
  let position = gl.getAttribLocation(glProgram, "position");
  gl.vertexAttribPointer(
    position,
    3,
    gl.FLOAT,
    false,
    FLOAT_BYTES * 5,
    0
  );
  gl.enableVertexAttribArray(position);

  // bind the [texCoordU, texCoordV] to the 'texCoord' shader attribute
  let texCoord = gl.getAttribLocation(glProgram, "texCoord");
  gl.vertexAttribPointer(
    texCoord,
    2,
    gl.FLOAT,
    false,
    FLOAT_BYTES * 5,
    FLOAT_BYTES * 3
  );
  gl.enableVertexAttribArray(texCoord);

  let normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  let normal = gl.getAttribLocation(glProgram, "normal");
  gl.vertexAttribPointer(
    normal,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(normal);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

function loadTexture(gl: Readonly<WebGL2RenderingContext>, glProgram: Readonly<WebGLProgram>, imageSource: string): WebGLTexture | null {
  const texture = gl.createTexture();
  let sampler = gl.getUniformLocation(glProgram, "theSampler");
  let image = new Image();
  image.src = imageSource;
  image.onload = function(){

    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  
    // Enable texture 0
    gl.activeTexture(gl.TEXTURE0);
  
    // Set the texture's target (2D or cubemap)
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Stretch/wrap options
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // Bind image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Pass texture 0 to the sampler
    gl.uniform1i(sampler, 0);
  };

  return texture;
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
