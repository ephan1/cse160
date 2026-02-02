// Shaders

// Input: an array of points comes from javascript.
// In this example, think of this array as the variable a_Position;
// Q: Why a_Position is not an array?
// A: Because the GPU process every vertex in parallel
// The language that we use to write the shaders is called GLSL

// Output: sends "an array of points" to the rasterizer.

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;
// We will use HTML sliders to set this variable
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix; 

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })
    if (!gl) {
        console.log('Failed to get rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initalize shaders');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get storage location of a_Position');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get storage location of u_FragColor');
        return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get storage location of u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get storage location of u_GlobalRotateMatrix');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLES = 1;
const CIRCLE = 2;
//let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_LegAngle = 0;
let g_HeadAngle = 90;
let g_BodyAngle = 0;
let g_LegAnimation = false;
let g_HeadAnimation = false;

function addActionsforHtmlUI() {
    document.getElementById('animationLegsOffButton').onclick = function() {g_LegAnimation=false;};
    document.getElementById('animationLegsOnButton').onclick = function() {g_LegAnimation=true;};
    document.getElementById('animationHeadOffButton').onclick = function() {g_HeadAnimation=false;};
    document.getElementById('animationHeadOnButton').onclick = function() {g_HeadAnimation=true;};
    document.getElementById('LegsSlide').addEventListener('mousemove', function() {g_LegAngle = this.value; renderAllShapes();});
    document.getElementById('BodySlide').addEventListener('mousemove', function() {g_BodyAngle = this.value; renderAllShapes();});
    document.getElementById('HeadSlide').addEventListener('mousemove', function() {g_HeadAngle = this.value; renderAllShapes();}); 
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
}

function renderAllShapes() {
    var startTime = performance.now();
    
    var globalRotMat = new Matrix4().setRotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var body = new cube();
    body.color = [0.3, 0.2, 0.1, 1.0];
    body.matrix.translate(-0.9, 0, 0.5);
    body.matrix.setRotate(-5, 1, 0,0);
    body.matrix.scale(0.3, 0.2, 0.5);
    body.render();

    var frontLeftThigh = new cube();
    frontLeftThigh.color = [0.3, 0.2, 0.1, 1.0];
    frontLeftThigh.matrix = new Matrix4(body.matrix);
    frontLeftThigh.matrix.translate(0.15, -0.4, 0.15);
    //frontLeftThigh.matrix.rotate(-5, 1,0,0);
    frontLeftThigh.matrix.setRotate(g_LegAngle, 1, 0, 0);
    frontLeftThigh.matrix.scale(0.10, -0.27, 0.15);
    frontLeftThigh.render(); 

    var frontLeftCalf = new cube();
    frontLeftCalf.color = [0.5, 0.5, 0.5, 1.0];
    frontLeftCalf.matrix = new Matrix4(frontLeftThigh.matrix);
    frontLeftCalf.matrix.translate(-0.1, -1.0, 0.15);
    frontLeftCalf.matrix.setRotate(g_LegAngle, 1, 0,0);
    frontLeftCalf.matrix.scale(0.10, -0.27, 0.05);
    frontLeftCalf.render();

    var frontleftHoof = new cube();
    frontleftHoof.color = [0.3, 0.2, 0.1, 1.0];
    frontleftHoof.matrix = new Matrix4(frontLeftCalf.matrix);
    frontleftHoof.matrix.translate(0, 1, 0);
    frontleftHoof.matrix.scale(1.2, 0.4, 2.6);
    frontleftHoof.render();


    var frontRightThigh = new cube();
    frontRightThigh.color = [0.75, 0.75, 0.75, 1];
    frontRightThigh.matrix = new Matrix4(body.matrix);
    frontRightThigh.matrix.translate(0.4, -0.4, -0.15)
    frontRightThigh.matrix.setRotate(-g_LegAngle, 1, 0, 0);
    frontRightThigh.matrix.scale(0.1, -0.27, 0.15);
    frontRightThigh.render();

    var frontRightCalf = new cube();
    frontRightCalf.color = [0.5, 0.5, 0.5, 1.0];
    frontRightCalf.matrix = new Matrix4(frontRightThigh.matrix);
    frontRightCalf.matrix.translate(-0.15, -1.0, 0);
    frontRightCalf.matrix.setRotate(-g_LegAngle, 1, 0, 0);
    frontRightCalf.matrix.scale(0.3, -0.27, 0.1);
    frontRightCalf.render();

    var frontRightHoof = new cube();
    frontRightHoof.color = [0.3, 0.2, 0.1, 1];
    frontRightHoof.matrix = new Matrix4(frontRightCalf.matrix);
    frontRightHoof.matrix.translate(0, 1, 0);
    frontRightHoof.matrix.scale(1.0, 0.3, 1.2);
    frontRightHoof.render();

    var backLeftThigh = new cube();
    backLeftThigh.color = [0.75, 0.75, 0.75, 1];
    backLeftThigh.matrix = new Matrix4(body.matrix);
    backLeftThigh.matrix.translate(0.4, -0.4, -0.15);
    backLeftThigh.matrix.setRotate(-g_LegAngle, 1, 0, 0);
    backLeftThigh.matrix.scale(0.3, -0.27, 0.15);
    backLeftThigh.render();


    var backLeftCalf = new cube();
    backLeftCalf.color = [0.7, 0.7, 0.7, 1];
    backLeftCalf.matrix = new Matrix4(backLeftThigh.matrix);
    backLeftCalf.matrix.translate(-0.15, -1.0, 0);
    backLeftCalf.matrix.setRotate(-g_LegAngle * 0.6, 1, 0, 0);
    backLeftCalf.matrix.scale(0.10, -0.27, 0.05);
    backLeftCalf.render();


    var backLeftHoof = new cube();
    backLeftHoof.color = [0.3, 0.2, 0.1, 1];
    backLeftHoof.matrix = new Matrix4(backLeftCalf.matrix);
    backLeftHoof.matrix.translate(0, 1.0, 0);
    backLeftHoof.matrix.scale(1.0, 0.3, 1.2);
    backLeftHoof.render();

    var backRightThigh = new cube();
    backRightThigh.color = [0.75, 0.75, 0.75, 1];
    backRightThigh.matrix = new Matrix4(body.matrix);
    backRightThigh.matrix.translate(0.9, -0.5, -0.18);
    backRightThigh.matrix.setRotate(g_LegAngle, 1, 0, 0);
    backRightThigh.matrix.scale(0.1, -0.27, 0.15);
    backRightThigh.render();


    let backRightCalf = new cube();
    backRightCalf.color = [0.7, 0.7, 0.7, 1];
    backRightCalf.matrix = new Matrix4(backRightThigh.matrix);
    backRightCalf.matrix.translate(1, -1.0, 0);
    backRightCalf.matrix.setRotate(g_LegAngle * 0.6, 1, 0, 0);
    backRightCalf.matrix.scale(0.3, -0.27, 0.1);
    backRightCalf.render();

    var backRightHoof = new cube();
    backRightHoof.color = [0.3, 0.2, 0.1, 1];
    backRightHoof.matrix = new Matrix4(backRightCalf.matrix);
    backRightHoof.matrix.translate(0, 1.0, 0);
    backRightHoof.matrix.scale(1.0, 0.3, 1.2);
    backRightHoof.render();

    var neck = new cube();
    neck.color = [0.8, 0.8, 0.8, 1.0];
    neck.matrix = new Matrix4(body.matrix);
    neck.matrix.translate(0.5, 0.5, 0.8);
    neck.matrix.setRotate(g_HeadAngle, -1, 0, 0);
    neck.matrix.scale(0.2, 0.3, 0.12);
    neck.render();

    /*
    var head = new cube();
    head.color = [0.85, 0.85, 0.85, 1.0];
    head.matrix = new Matrix4(neck.matrix);
    head.matrix.translate(0.5, 0.4, 0.0);
    head.matrix.setRotate(-3, 2, 0,0);
    head.matrix.scale(0.3, 0.2, 0.4);
    head.render();
    */

    
    var duration = performance.now() - startTime;
    sendTextToHTML(`ms: ${Math.floor(duration)} fps: ${Math.floor(1000 / duration) / 100}`, "numdot");
}

function convertCoordinatesEventToGl(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);
    return ([x, y]);
}

let g_shapesList = [];

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
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

}

/*
function click(ev) {
    let point;
    let [x, y] = convertCoordinatesEventToGl(ev);
    //check
    if (g_selectedType==POINT) { 
        point = new Point();
    } else if (g_selectedType==TRIANGLES) {
        point = new triangle();
    } else {
        point = new cube();
    }
    point.position=[x,y];
    //point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
    renderAllShapes();
}
*/

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsforHtmlUI();
    //canvas.onmousedown = click;
    //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    renderAllShapes();
    //requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function updateAnimationAngles() {
    if (g_LegAnimation) {
        g_LegAngle = (50*Math.sin(g_seconds));
    }
    if (g_HeadAnimation) {
        g_HeadAngle = (20*Math.sin(3*g_seconds));
    }
}


function tick() {
    g_seconds = performance.now()/1000.0-g_startTime;
    console.log(g_seconds);
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
}


function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;   
}
