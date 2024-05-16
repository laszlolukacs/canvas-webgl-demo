/*
 * See LICENSE for details.
 */

import vertexShaderSource from './shaders/textured-lighted.vert?raw';
import fragmentShaderSource from './shaders/textured-lighted.frag?raw';
import textureUrl from './textures/WebGL_texture.png'
import { createPerspectiveMatrix } from './camera';
import { VertexAttrib, compileShaders, loadTexture, setupIndexBuffer, setupVertexBuffer } from './glutils';

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

  console.log("WebGL Version:", gl.getParameter(gl.VERSION));
  console.log("WebGL Vendor:", gl.getParameter(gl.VENDOR));
  console.log("WebGL Renderer:", gl.getParameter(gl.RENDERER));

  let glProgram = compileShaders(gl, vertexShaderSource, fragmentShaderSource);
  if (glProgram == null) {
    console.error("Error during shader compilation, see the logs above");
    return;
  }

  let vertices = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0,   //v1
    -1.0, 1.0, 1.0, 0.0, 1.0,  //v2
    -1.0, -1.0, 1.0, 0.0, 0.0, //v3
    1.0, -1.0, 1.0, 1.0, 0.0,  //v3 -- front

    1.0, 1.0, 1.0, 1.0, 1.0,   //v5
    1.0, -1.0, 1.0, 0.0, 1.0,  //v6
    1.0, -1.0, -1.0, 0.0, 0.0, //v7
    1.0, 1.0, -1.0, 1.0, 0.0,  // v8 right

    1.0, 1.0, 1.0, 1.0, 1.0,   //v9
    1.0, 1.0, -1.0, 1.0, 0.0,  //v10
    -1.0, 1.0, -1.0, 0.0, 0.0, //v11
    -1.0, 1.0, 1.0, 0.0, 1.0,  //v12 up

    -1.0, 1.0, 1.0, 1.0, 1.0,   //v13
    -1.0, 1.0, -1.0, 1.0, 0.0,  //v14
    -1.0, -1.0, -1.0, 0.0, 0.0, //v15
    -1.0, -1.0, 1.0, 0.0, 1.0,  //v16 left

    -1.0, -1.0, -1.0, 0.0, 0.0, //v17
    1.0, -1.0, -1.0, 1.0, 0.0,  //v18
    1.0, -1.0, 1.0, 1.0, 1.0,   //v19
    -1.0, -1.0, 1.0, 0.0, 1.0,  //v20 down

    1.0, -1.0, -1.0, 1.0, 0.0,  //v21
    -1.0, -1.0, -1.0, 0.0, 0.0, //v22
    -1.0, 1.0, -1.0, 0.0, 1.0,  //v23
    1.0, 1.0, -1.0, 1.0, 1.0,   //v24 back
  ]);

  let normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // back
  ]);

  let cubeIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3,  // front
    4, 5, 6, 4, 6, 7,  // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23  // back
  ]);

  setupVertexBuffer(gl, glProgram, vertices, [new VertexAttrib("position", 3, 5, 0), new VertexAttrib("texCoord", 2, 5, 3)]);
  setupVertexBuffer(gl, glProgram, normals, [new VertexAttrib("normal", 3, 3, 0)]);
  setupIndexBuffer(gl, cubeIndices);

  loadTexture(gl, glProgram, "theSampler", textureUrl);

  // Set the diffuse light color (white) and direction
  let lightColor = gl.getUniformLocation(glProgram, "lightColor");
  gl.uniform3f(lightColor, 1.0, 1.0, 1.0);
  let lightDirection = gl.getUniformLocation(glProgram, "lightPosition");
  gl.uniform3f(lightDirection, 1.4, 1.3, 1.5);

  // Set the ambient light color
  let ambientLight = gl.getUniformLocation(glProgram, "ambientLight");
  gl.uniform3f(ambientLight, 0.1, 0.1, 0.1);

  let cameraMatrix = createPerspectiveMatrix(30.0, glcanvas.width, glcanvas.height, 0.01, 100.0);
  cameraMatrix.translateSelf(0.0, 0.0, -5.0).rotateSelf(40, 0, 0).rotateSelf(0, -45, 0);

  let model = gl.getUniformLocation(glProgram, "model");
  let mvp = gl.getUniformLocation(glProgram, "mvp");

  let cubeAngle = 0.0;

  gl.enable(gl.DEPTH_TEST);

  setInterval(() => {
    cubeAngle += 1.0;

    let modelMatrix = new DOMMatrix();
    modelMatrix.rotateSelf(0, cubeAngle, -cubeAngle);
    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());

    let mvpMatrix = new DOMMatrix(modelMatrix);
    mvpMatrix.preMultiplySelf(cameraMatrix);
    gl.uniformMatrix4fv(mvp, false, mvpMatrix.toFloat32Array());

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // the actual rendering
    gl.drawElements(
      gl.TRIANGLES,
      cubeIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  })
}
