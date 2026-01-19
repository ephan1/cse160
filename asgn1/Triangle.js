class Triangle {
    constructor() {
        this.type='triangle';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }
    render() {
        var xy = this.position;
        var rgba = this.color;
        var d = this.size / 200.0;
        gl.uniform4f(u_FragColor, ...rgba);
        gl.uniform1f(u_Size, this.size);
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
        //drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
    }
} 
function drawTriangle(vertices) {
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create buffer');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n)
}
