class triangle{
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
  

  function drawTriangle3D(vertices) {
    //let n = 3;
    var n = vertices.length/3;
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    //gl.disableVertexAttribArray(a_UV);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    g_vertexBuffer=null;
  }
  
  function drawTriangle3DUV(vertices, uv) {
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log('Failed to create buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    g_vertexBuffer=null;
  }

  function drawTriangle3DUVNormal(vertices, uv, normals) {
    var n = vertices.length/3;
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log('Failed to create buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);
    
    var normalBuffer = gl.createBuffer();
    if (!normalBuffer) {
      console.log('Failed to create buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
    
    gl.drawArrays(gl.TRIANGLES, 0, n);
    g_vertexBuffer=null;
    
  }