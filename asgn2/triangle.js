class triangle {
    constructor() {
      this.type='triangle';
      this.position = [0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
    }
    render() {
      gl.uniform4f(u_FragColor, ...this.color);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      drawTriangle3D([0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0]);
    }
  }
  
  let g_triangleBuffer = null;

  function drawTriangle3D(vertices) {
    let n = 3;
    if (!g_triangleBuffer) {
      g_triangleBuffer = gl.createBuffer();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n)
  }
