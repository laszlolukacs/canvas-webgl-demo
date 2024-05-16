/*
 * See LICENSE for details.
 */

export function compileShaders(gl: Readonly<WebGL2RenderingContext>, vertSrc: string, fragSrc: string): WebGLProgram | null {
    if (gl === null
        || vertSrc === null
        || fragSrc === null
    ) {
        console.error("Either the WebGL context, the vertex shader source, or the fragment shader source has been not provided");
        return null;
    }

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (vertexShader == null) {
        console.error("Unable to create vertex shader");
        return null;
    }

    gl.shaderSource(vertexShader, vertSrc);
    gl.compileShader(vertexShader);

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader == null) {
        console.error("Unable to create fragment shader");
        return null;
    }

    gl.shaderSource(fragmentShader, fragSrc);
    gl.compileShader(fragmentShader);

    let glProgram = gl.createProgram();
    if (glProgram == null) {
        console.error("Unable to create shader program");
        return null;
    }

    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    gl.linkProgram(glProgram);
    gl.useProgram(glProgram);

    console.log("Vertex shader:", gl.getShaderInfoLog(vertexShader) || "OK");
    console.log("Fragment shader:", gl.getShaderInfoLog(fragmentShader) || "OK");

    return glProgram;
}

export class VertexAttrib {
    readonly name: string;
    readonly size: number;
    readonly stride: number;
    readonly offset: number;

    constructor(name: string, size = 3, stride = 3, offset = 0) {
        this.name = name;
        this.size = size;
        this.stride = stride;
        this.offset = offset;
    }
}

export function setupVertexBuffer(gl: Readonly<WebGL2RenderingContext>, glProgram: Readonly<WebGLProgram>, vertices: Readonly<Float32Array>, attributes: Readonly<(VertexAttrib)[]>) {
    if (gl == null
        || glProgram == null
        || vertices == null
        || attributes == null) {
        console.error("Either the WebGL context, the shader program, the vertices array or the attributes has not been provided");
        return;
    }

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;

    attributes.forEach(attrib => {
        let location = gl.getAttribLocation(glProgram, attrib.name);
        gl.vertexAttribPointer(
            location,
            attrib.size,
            gl.FLOAT,
            false,
            FLOAT_BYTES * attrib.stride,
            FLOAT_BYTES * attrib.offset
        );
        gl.enableVertexAttribArray(location);
    });
}

export function setupIndexBuffer(gl: Readonly<WebGL2RenderingContext>, indices: Readonly<Uint16Array>) {
    if (gl == null || indices == null) {
        console.error("Either the WebGL context, or the indices array has not been provided");
    }

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

export function loadTexture(gl: Readonly<WebGL2RenderingContext>, glProgram: Readonly<WebGLProgram>, samplerAttributeName: string, imageSource: string): WebGLTexture | null {
    if (gl == null
        || glProgram == null
        || samplerAttributeName == null
        || imageSource == null) {
        console.error("Either the WebGL context, the shader program, the sampler's attribute name, or the image source has not been provided");
        return null;
    }

    const texture = gl.createTexture();
    let sampler = gl.getUniformLocation(glProgram, samplerAttributeName);
    let image = new Image();
    image.src = imageSource;
    image.onload = function () {

        // Flip the image's y axis, otherwise will look upside-down
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(sampler, 0);
    };

    return texture;
}
