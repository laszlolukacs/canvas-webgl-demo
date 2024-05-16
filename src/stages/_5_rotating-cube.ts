/*
 * See LICENSE for details.
 */

import vertexShaderSource from '../shaders/modelview-color.vert?raw';
import fragmentShaderSource from '../shaders/passthrough-color.frag?raw';
import { createPerspectiveMatrix } from '../camera';
import { VertexAttrib, compileShaders, setupIndexBuffer, setupVertexBuffer } from '../glutils';

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

  const cubeIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    0, 3, 4, 0, 4, 5,
    0, 5, 6, 0, 6, 1,
    1, 6, 7, 1, 7, 2,
    7, 4, 3, 7, 3, 2,
    4, 7, 6, 4, 6, 5
  ]);

  setupVertexBuffer(gl, glProgram, vertices, [new VertexAttrib("position", 3, 6, 0), new VertexAttrib("color", 3, 6, 3)]);
  setupIndexBuffer(gl, cubeIndices);

  let cameraMatrix = createPerspectiveMatrix(30.0, glcanvas.width, glcanvas.height, 0.01, 100.0);
  cameraMatrix.translateSelf(0.0, 0.0, -5.0);
  cameraMatrix.rotateSelf(0.0, 33.0, 0.0);

  let model = gl.getUniformLocation(glProgram, "model");
  let mvp = gl.getUniformLocation(glProgram, "mvp");
  let cubeAngle = 0.0;

  gl.enable(gl.DEPTH_TEST);

  setInterval(() => {
    cubeAngle += 0.5;
    let modelMatrix = new DOMMatrix();
    modelMatrix.rotateSelf(0, cubeAngle, -cubeAngle);
    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());
    var mvpMatrix = new DOMMatrix(modelMatrix);
    mvpMatrix.preMultiplySelf(cameraMatrix);
    gl.uniformMatrix4fv(mvp, false, mvpMatrix.toFloat32Array());
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(
      gl.TRIANGLES,
      36,
      gl.UNSIGNED_SHORT,
      0
    );
  })
}
