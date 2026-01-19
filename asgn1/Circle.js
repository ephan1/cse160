class Circle{
    constructor() {
        this.type='circle';
        this.position = [0.0, 0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
    }
    render() {
        var xy = this.position;
        var rgba = this.color;
        var d = this.size/200.0;
        var segments = this.segments;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        let angleStep=(2 * Math.PI)/segments;
        for (let i = 0; i < segments; i++) {
            let angle1 = i * angleStep;
            let angle2 = (i + 1) * angleStep;
            let x1 = xy[0] + Math.cos(angle1) * d;
            let y1 = xy[1] + Math.sin(angle1) * d;
            let x2 = xy[0] + Math.cos(angle2) * d;
            let y2 = xy[1] + Math.sin(angle2) * d;  
            drawTriangle([xy[0], xy[1], x1, y1, x2, y2]);
        }   
    }
}
