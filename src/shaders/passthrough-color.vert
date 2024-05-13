    attribute vec4 position;
    attribute vec4 color;

    varying vec4 vColor;

    void main() {
      gl_Position = position;
      vColor = color;
    }