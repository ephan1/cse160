// Shaders

// Input: an array of points comes from javascript.
// In this example, think of this array as the variable a_Position;
// Q: Why a_Position is not an array?
// A: Because the GPU process every vertex in parallel
// The language that we use to write the shaders is called GLSL

// Output: sends "an array of points" to the rasterizer.
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }
`;

// Input: a fragment (a grid of pixels) comes from the rasterizer.
// It doesn't have vertices as input
// Ouput: a color goes to HTML canvas.
var FSHADER_SOURCE = `
    precision mediump float;

    uniform vec4 u_FragColor;

    void main() {
        gl_FragColor = u_FragColor;
    }
`;
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
const POINT = 0;
const TRIANGLES = 1;
const CIRCLE = 2;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5.0;
let g_selectedType=POINT;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })
    if (!gl) {
        console.log('Failed to get rendering context for WebGL');
        return;
    }
}

function addActionsforHtmlUI() {
    document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes(); };
    document.getElementById('loadImageButton').onclick = function() { loadImageasTriangles("drawing.jpg")}
    document.getElementById('pointButton').onclick = function() {g_selectedType = POINT};
    document.getElementById('TrianglesButton').onclick = function() {g_selectedType=TRIANGLES};
    document.getElementById('CirclesButton').onclick = function() {g_selectedType = CIRCLE};
    document.getElementById('redSlide').addEventListener('input', function() {g_selectedColor[0] = this.value/100}); //check
    document.getElementById('greenSlide').addEventListener('input', function() {g_selectedColor[1] = this.value/100 }); 
    document.getElementById('blueSlide').addEventListener('input', function() {g_selectedColor[2] = this.value/100 }); 
    document.getElementById('sizeSlide').addEventListener('input', function() {g_selectedSize = Number(this.value)});
    document.getElementById('segmentSlide').addEventListener('input', function() {g_selectedSize = Number(this.value)});
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initalize shaders');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (a_Position < 0 || !u_FragColor || !u_Size) {
        console.log("Failed to get storage location of a_position");
        return;
    }
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsforHtmlUI();
    let canvas = document.getElementById("webgl");
    canvas.onmousedown = click;
    canvas.onmousemove = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1) (click(ev))};
    // Retrieve WebGl rendering context
    let gl = getWebGLContext(canvas);
    if(!gl) {
        console.log("Failed to get WebGL context.")
        return -1;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

}


class Point {
    constructor() {
        this.type = 'point';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }
    render() {
        var xy = this.position;
        var rgba = this.color; 
        var size = this.size;
        gl.disableVertexAttribArray(a_Position);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ xy[0], xy[1]]), gl.DYNAMIC_DRAW);
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

}
let g_shapesList = [];

function click(ev) {
    let point;
    let [x, y] = convertCoordinatesEventToGl(ev);
    //check
    if (g_selectedType==POINT) { 
        point = new Point();
    } else if (g_selectedType==TRIANGLES) {
        point = new Triangle();
    } else {
        point = new Circle();
    }
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
    renderAllShapes();
}


function renderAllShapes() {
    var startTime = performance.now();
    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    var duration = performance.now() - startTime;
    sendTextToHTML('numdot: ' + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/10, "numdot");
    } 
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID)
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;   
}

function convertCoordinatesEventToGl(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);
    return ([x, y]);
}

function loadImageasTriangles(imagePath) {
    var img = new Image();
    img.src = imagePath;
    img.onload = function() {
        var tempCanvas = document.createElement('canvas');
        var ctx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, img.width, img.height).data;
        var step = 6;
        
        for (let y = 0; y < img.height; y += step) {
            for (let x = 0; x < img.width; x += step) {
                var index = (y * img.width + x) * 4;
                var r = imageData[index] / 255;
                var g = imageData[index + 1] / 255;
                var b = imageData[index + 2] / 255;
                var a = imageData[index + 3] / 255;
                if (a < 0.1) continue;
                var p = new Triangle();
                 
                p.position = [(x / img.width) * 2 -1, 1 - (y / img.height) * 2]
                p.color = [r, g, b, 1.0];
                p.size = step;
                g_shapesList.push(p);
            }
        }
        renderAllShapes();
    }
}
