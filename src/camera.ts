export function createPerspectiveMatrix(fov: number, canvasWidth: number, canvasHeight: number, near: number, far: number): DOMMatrix {
    const fovInRadians = fov * Math.PI / 180;
    const aspect = canvasWidth / canvasHeight;
    const actualNear = near < 0.01 ? 0.01 : near;
    const inverseFov = 1 / Math.tan(fovInRadians);
    const inverseDistance = 1 / (actualNear - far);

    return new DOMMatrix([
        inverseFov / aspect, 0.0, 0.0, 0.0,
        0.0, inverseFov, 0.0, 0.0,
        0.0, 0.0, (far + actualNear) * inverseDistance, -1.0,
        0.0, 0.0, (2 * actualNear * far) * inverseDistance, 0.0
    ]);
}

// see https://github.com/toji/gl-matrix/blob/master/src/mat4.js#L1740
export function createLookAtMatrix(eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX = 0.0, upY = 1.0, upZ = 0.0): DOMMatrix {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

    z0 = eyeX - centerX;
    z1 = eyeY - centerY;
    z2 = eyeZ - centerZ;

    len = 1 / Math.hypot(z0, z1, z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;

    len = 1 / Math.hypot(x0, x1, x2);
    x0 *= len;
    x1 *= len;
    x2 *= len;

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = 1/ Math.hypot(y0, y1, y2);
    y0 *= len;
    y1 *= len;
    y2 *= len;

    return new DOMMatrix([
      x0, y0, z0, 0,
      x1, y1, z1, 0,
      x2, y2, z2, 0,
      -(x0 * eyeX + x1 * eyeY + x2 * eyeZ), -(y0 * eyeX + y1 * eyeY + y2 * eyeZ), -(z0 * eyeX + z1 * eyeY + z2 * eyeZ), 1
    ]); 
}
