// Phong calculated based on: https://en.wikipedia.org/wiki/Phong_reflection_model

// Shaders (GLSL)
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec4 v_VertPos;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        //mat4 NormalMatrix = transpose(inverse(u_ModelMatrix));
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
        //v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;   
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture; 
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;

    void main() {
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);

        } else if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);

        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);

        } else {
            gl_FragColor = vec4(1,0.2,0.2,1);
        }

        vec3 lightVector = u_lightPos - vec3(v_VertPos);
        float r=length(lightVector);
        
        //N dot L 
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);

        //Reflection
        vec3 R = reflect(-L, N);

        //eye
        vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
        
        //specular
        float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

        vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.2;
        if (u_lightOn) {
            if (u_whichTexture == 0) {
                gl_FragColor = vec4(specular+diffuse+ambient , 1.0);
            } else {
                gl_FragColor = vec4(diffuse+ambient, 1.0);    
            }
        }
    }
`;
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_NormalMatrix; 
let u_lightPos;
let u_cameraPos;
let u_lightOn; 

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
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get storage location of a_UV');
        return;
    }
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get storage location of a_Normal');
        return false;
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
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get storage location of u_ProjectionMatrix');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get u_ViewMatrix');
        return;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get storage location of u_whichTexture');
        return;
    }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get storage location for u_Sampler0');
        return false;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get storage location for u_Sampler1');
        return false;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get storage location for u_Sampler2');
        return false;
    }
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    if (!u_NormalMatrix) {
        console.log('Failed to get storage location of u_NormalMatrix');
        return false;
    }
    u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
    if (!u_lightOn) {
        console.log('Failed to get storage location of u_lightOn');
        return false;
    }
    u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
    if (!u_lightPos) {
        console.log('Failed to get storage location of u_lightPos');
        return false;
    }
    u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
    if (!u_cameraPos) {
        console.log('Failed to get storage location of u_cameraPos');
        return false;
    }

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_UV);
    gl.enableVertexAttribArray(a_Normal);

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function sendTexturetoTEXTURE0(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log("failed to create the texture object");
        return false;
    } 
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);
    console.log('finished loadTexture'); 
}

function sendTexturetoTEXTURE1(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log("failed to create the texture object");
        return false;
    } 
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler1, 1);
    console.log('finished loadTexture'); 
}

function sendTexturetoTEXTURE2(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log("failed to create the texture object");
        return false;
    } 
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, 2);
    console.log('finished loadTexture'); 
}

function initTextures() {
    var image0 = new Image();
    //var image2 = new Image();
    if (!image0) {
        console.log('Failed to create image object');       
        return false;
    }
    image0.onload = function() { sendTexturetoTEXTURE0(image0);};
    //image.onload = function() {sendTexturetoTEXTURE0(image2);};
    //image.src = 'textures/block.jpg';
    image0.src = 'purple.png';
    //image2.src = 'textures/block.jpg';
    var image1 = new Image();   
    if (!image1) {
        console.log('Failed to create image object');
        return false;
    }
    image1.onload = function(){ sendTexturetoTEXTURE1(image1);};
    image1.src = 'mine.jpg';

    var image2 = new Image();   
    if (!image2) {
        console.log('Failed to create image object');
        return false;
    }
    image2.onload = function(){ sendTexturetoTEXTURE2(image2);};
    image2.src = 'obama.png';
    return true;
}


const POINT = 0;
const TRIANGLES = 1;
const CIRCLE = 2;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_LegAngle = 0;
let g_HeadAngle = 90;
let g_BodyAngle = 0;
let g_LegAnimation = false;
let g_HeadAnimation = false;
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0, 1, -2];


function addActionsforHtmlUI() {
    document.getElementById('lightOn').onclick = function() {g_lightOn=true};
    document.getElementById('lightOff').onclick = function() {g_lightOn=false};
    document.getElementById('normalOn').onclick = function() {g_normalOn=true};
    document.getElementById('normalOff').onclick = function() {g_normalOn=false};
    document.getElementById('animationLegsOffButton').onclick = function() {g_LegAnimation=false;};
    document.getElementById('animationLegsOnButton').onclick = function() {g_LegAnimation=true;};
    document.getElementById('animationHeadOffButton').onclick = function() {g_HeadAnimation=false;};
    document.getElementById('animationHeadOnButton').onclick = function() {g_HeadAnimation=true;};
    document.getElementById('LegsSlide').addEventListener('mousemove', function() {g_LegAngle = this.value; renderAllShapes();});
    document.getElementById('BodySlide').addEventListener('mousemove', function() {g_BodyAngle = this.value; renderAllShapes();});
    document.getElementById('HeadSlide').addEventListener('mousemove', function() {g_HeadAngle = this.value; renderAllShapes();}); 
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    //canvas.onmousemove = function(ev) {if(ev.buttons) {click(ev)}};
}
/*
function drawModel(model) {
    // Update model matrix combining translate, rotate and scale from cube
    modelMatrix.setIdentity();

    // Apply translation for this part of the animal
    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);

    // Send vertices and indices from model to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

    // Draw model
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

    //gl.uniform3f(u_Color, 0.0, 1.0, 0.0);

    //gl.drawElements(gl.LINE_LOOP, model.indices.length, gl.UNSIGNED_SHORT, 0);
}
*/

var g_map = [
[1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,1,1,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,1],
[1,0,0,0,1,0,0,1],
[1,0,0,0,0,0,0,1],
];

function drawMap() {
    for (let x=0; x<g_map.length; x++) {
        for (let y=0; y<g_map[x].length; y++) {
            //console.log(x,y);
            if (g_map[x][y] > 0) {
                var ground = new cube();
                ground.color = [0.8, 1.0, 1.0, 1.0];
                ground.textureNum=0;
                ground.matrix.translate(0, -0.2, 0);
                ground.matrix.scale(0.3, 0.3, 0.3);
                ground.matrix.translate(x-6, -0.75, y-6);
                ground.render();
            }
        }
    }
}



var g_camera;
function renderAllShapes() {
    // Draw frame

    var startTime = performance.now();
    
    //var projMat = new Matrix4();
    //projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
    //gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    
    //var viewMat = new Matrix4();
    /*
    viewMat.setLookAt(
    g_camera.eye.elements[0],
    g_camera.eye.elements[1],
    g_camera.eye.elements[2],
    g_camera.at.elements[0],
    g_camera.at.elements[1],
    g_camera.at.elements[2],
    g_camera.up.elements[0],
    g_camera.up.elements[1],
    g_camera.up.elements[2]
    );
    */
    
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
    //gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().setRotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);

    var light = new cube();
    light.color = [2,2,0,1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.render();

    var sp = new Sphere();
    sp.textureNum = 2;
    if (g_normalOn) sp.textureNum =-3;
    sp.matrix.translate(-0.5, 0, 0);
    sp.matrix.scale(0.4,0.4,0.4);
    sp.render(); 
    
    var sky = new cube();
    sky.color = [0.678, 0.847, 0.902, 1.0];
    if (g_normalOn) sky.textureNum = -3;
    //sky.textureNum = -2;
    sky.matrix.scale(50,50,50);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    //drawMap();

    var groundplane = new cube();
    groundplane.color = [1.0, 0.0, 0.0, 1.0];
    groundplane.textureNum=1;
    groundplane.matrix.translate(0, -0.45, 0.0);
    groundplane.matrix.scale(10, 0, 10);
    groundplane.matrix.translate(-0.5, 0, -0.5);
    groundplane.render();

    var body = new cube();
    body.color = [0.3, 0.2, 0.1, 1.0];
    //if (g_normalOn) body.textureNum = -3;
    body.textureNum=-2;
    body.matrix.translate(-0.9, 0, 0.5);
    body.matrix.setRotate(-5, 1, 0,0);
    body.matrix.scale(0.3, 0.2, 0.5);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.render();

    var frontLeftThigh = new cube();
    frontLeftThigh.color = [0.3, 0.2, 0.1, 1.0];
    frontLeftThigh.matrix = new Matrix4(body.matrix);
    frontLeftThigh.textureNum=-2;
    frontLeftThigh.matrix.translate(0.15, -0.4, 0.15);
    //frontLeftThigh.matrix.rotate(-5, 1,0,0);
    frontLeftThigh.matrix.setRotate(g_LegAngle, 1, 0, 0);
    frontLeftThigh.matrix.scale(0.10, -0.27, 0.15);
    frontLeftThigh.render(); 

    var frontLeftCalf = new cube();
    frontLeftCalf.color = [0.5, 0.5, 0.5, 1.0];
    frontLeftCalf.matrix = new Matrix4(frontLeftThigh.matrix);
    frontLeftCalf.textureNum=-2;
    frontLeftCalf.matrix.translate(-0.1, -1.0, 0.15);
    frontLeftCalf.matrix.setRotate(g_LegAngle, 1, 0,0);
    frontLeftCalf.matrix.scale(0.10, -0.27, 0.05);
    frontLeftCalf.render();

    var frontleftHoof = new cube();
    frontleftHoof.color = [0.3, 0.2, 0.1, 1.0];
    frontleftHoof.matrix = new Matrix4(frontLeftCalf.matrix);
    frontleftHoof.textureNum=-2;
    frontleftHoof.matrix.translate(0, 1, 0);
    frontleftHoof.matrix.scale(1.2, 0.4, 2.6);
    frontleftHoof.render();

    var frontRightThigh = new cube();
    frontRightThigh.color = [0.75, 0.75, 0.75, 1];
    frontRightThigh.matrix = new Matrix4(body.matrix);
    frontRightThigh.textureNum=-2;
    frontRightThigh.matrix.translate(0.4, -0.4, -0.15)
    frontRightThigh.matrix.setRotate(-g_LegAngle, 1, 0, 0);
    frontRightThigh.matrix.scale(0.1, -0.27, 0.15);
    frontRightThigh.render();

    var frontRightCalf = new cube();
    frontRightCalf.color = [0.5, 0.5, 0.5, 1.0];
    frontRightCalf.matrix = new Matrix4(frontRightThigh.matrix);
    frontRightCalf.matrix.translate(-0.15, -1.0, 0);
    frontRightCalf.textureNum=-2;
    frontRightCalf.matrix.setRotate(-g_LegAngle, 1, 0, 0);
    frontRightCalf.matrix.scale(0.3, -0.27, 0.1);
    frontRightCalf.render();

    var frontRightHoof = new cube();
    frontRightHoof.color = [0.3, 0.2, 0.1, 1];
    frontRightHoof.matrix = new Matrix4(frontRightCalf.matrix);
    frontRightHoof.textureNum=-2;
    frontRightHoof.matrix.translate(0, 1, 0);
    frontRightHoof.matrix.scale(1.0, 0.3, 1.2);
    frontRightHoof.render();

    var backLeftThigh = new cube();
    backLeftThigh.color = [0.75, 0.75, 0.75, 1];
    backLeftThigh.matrix = new Matrix4(body.matrix);
    backLeftThigh.textureNum=-2;
    backLeftThigh.matrix.translate(0.4, -0.4, -0.15);
    backLeftThigh.matrix.setRotate(-g_LegAngle, 1, 0, 0);
    backLeftThigh.matrix.scale(0.3, -0.27, 0.15);
    backLeftThigh.render();

    var backLeftCalf = new cube();
    backLeftCalf.color = [0.7, 0.7, 0.7, 1];
    backLeftCalf.matrix = new Matrix4(backLeftThigh.matrix);
    backLeftCalf.textureNum=-2;
    backLeftCalf.matrix.translate(-0.15, -1.0, 0);
    backLeftCalf.matrix.setRotate(-g_LegAngle * 0.6, 1, 0, 0);
    backLeftCalf.matrix.scale(0.10, -0.27, 0.05);
    backLeftCalf.render();


    var backLeftHoof = new cube();
    backLeftHoof.color = [0.3, 0.2, 0.1, 1];
    backLeftHoof.matrix = new Matrix4(backLeftCalf.matrix);
    backLeftHoof.textureNum=-2;
    backLeftHoof.matrix.translate(0, 1.0, 0);
    backLeftHoof.matrix.scale(1.0, 0.3, 1.2);
    backLeftHoof.render();

    var backRightThigh = new cube();
    backRightThigh.color = [0.75, 0.75, 0.75, 1];
    backRightThigh.matrix = new Matrix4(body.matrix);
    backRightThigh.textureNum=-2;
    backRightThigh.matrix.translate(0.9, -0.5, -0.18);
    backRightThigh.matrix.setRotate(g_LegAngle, 1, 0, 0);
    backRightThigh.matrix.scale(0.1, -0.27, 0.15);
    backRightThigh.render();


    let backRightCalf = new cube();
    backRightCalf.color = [0.7, 0.7, 0.7, 1];
    backRightCalf.matrix = new Matrix4(backRightThigh.matrix);
    backRightCalf.textureNum=-2;
    backRightCalf.matrix.translate(1, -1.0, 0);
    backRightCalf.matrix.setRotate(g_LegAngle * 0.6, 1, 0, 0);
    backRightCalf.matrix.scale(0.3, -0.27, 0.1);
    backRightCalf.render();

    var backRightHoof = new cube();
    backRightHoof.color = [0.3, 0.2, 0.1, 1];
    backRightHoof.matrix = new Matrix4(backRightCalf.matrix);
    backRightHoof.textureNum=-2;
    backRightHoof.matrix.translate(0, 1.0, 0);
    backRightHoof.matrix.scale(1.0, 0.3, 1.2);
    backRightHoof.render();

    var neck = new cube();
    neck.color = [0.8, 0.8, 0.8, 1.0];
    neck.matrix = new Matrix4(body.matrix);
    neck.textureNum=-2;
    neck.matrix.translate(0.5, 0.5, 0.8);
    neck.matrix.setRotate(g_HeadAngle, -1, 0, 0);
    neck.matrix.scale(0.2, 0.3, 0.12);
    neck.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(`ms: ${Math.floor(duration)} fps: ${Math.floor(1000 / duration) / 10}`, "numdot");

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;   
}

function updateAnimationAngles() {
    if (g_LegAnimation) {
        g_LegAngle = (50*Math.sin(g_seconds));
    }
    if (g_HeadAnimation) {
        g_HeadAngle = (20*Math.sin(3*g_seconds));
    }
    g_lightPos[0] = 2.3*Math.cos(3*g_seconds);
}

/*
function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cube":
            model = new Cube(color);
            break;
        case "sphere":
            model = new Sphere(color);
            break;
    }
    if(model) {
        models.push(model);
    }

    return model;
}
function onZoomInput(value) {
    console.log(1.0 + value/10);
    camera.zoom(1.0 + value/10);
}
*/
/*
window.addEventListener("keydown", function(event) {
    let speed = 1.0;

    switch (event.key) {
        case "w":
            console.log("forward");
            g_camera.moveForward(speed);
            break;
        case "s":
            console.log("back");
            g_camera.moveForward(-speed);
            break;
        case "a":
            console.log("pan left");
            g_camera.pan(5);
            break;
        case "d":
            console.log("pan right");
            g_camera.pan(-5);
            break;

    }
});
*/

function keydown(ev) {
    if (ev.keyCode==39) { //rightarrow
        g_camera.turnRight();
    } else
    if (ev.keyCode==37) { //leftArrow 
        g_camera.turnLeft();
    }
    if (ev.keyCode == 87) {g_camera.forward(1);} //W
    if (ev.keyCode == 83) {g_camera.back();} //S
    if (ev.keyCode == 65) {g_camera.left();} //A
    if (ev.keyCode == 68) {g_camera.right();} //D 
    if (ev.keyCode == 81) {g_camera.turnLeft();} //Q
    if (ev.keyCode == 69) {g_camera.turnRight();} //E
    renderAllShapes();
    console.log(ev.keyCode);
}


function main() {
    // Clear screen
    setupWebGL();
    connectVariablesToGLSL();
    addActionsforHtmlUI();
    initTextures();
    updateAnimationAngles();
    document.onkeydown = keydown;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Retrieve uniforms from shaders
    // Set camera data
    g_camera = new Camera();
    requestAnimationFrame(tick);
    renderAllShapes();
}
    var g_startTime = performance.now()/1000.0;
    var g_seconds = performance.now()/1000.0-g_startTime;


    function tick() {
        g_seconds = performance.now()/1000.0-g_startTime;
        //console.log(g_seconds);
        updateAnimationAngles();
        renderAllShapes();
        requestAnimationFrame(tick);
    }



/*
u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");


    u_Color = gl.getUniformLocation(gl.program, "u_Color");

    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor = gl.getUniformLocation(gl.program, "u_diffuseColor");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");

    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");
    u_lightLocation = gl.getUniformLocation(gl.program, "u_lightLocation");


    u_eyePosition = gl.getUniformLocation(gl.program, "u_eyePosition");

    let n = 3;
    for (let i = -n/2; i < n/2; i++){
      let r = Math.random();
      let g = Math.random();
      let b = Math.random(); 

      let sphere = addModel([r, g, b], "sphere");
      sphere.setScale(0.5, 0.5, 0.5);
      sphere.setTranslate(2*i + 1.0, 0.5, 0.0);
    }

    pointLightSphere = new Sphere([1.0, 1.0, 1.0]);
    pointLightSphere.setScale(0.1, 0.1, 0.1);
    pointLightSphere.setTranslate(lightLocation);

    models.push(pointLightSphere);

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    // Set light Data

    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);

    gl.uniform3fv(u_lightDirection, lightDirection.elements);
*/
