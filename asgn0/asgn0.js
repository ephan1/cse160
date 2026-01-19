// DrawTriangle.js (c) 2012 matsuda

  function drawVector(v, color) {
    var canvas = document.getElementById('example');
    if (!canvas) { 
      console.log('Failed to retrieve the <canvas> element');
      return false; 
    }
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20; 
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + v.elements[0] * scale, centerY - v.elements[1] * scale);
    ctx.stroke();
  }

  function handleDrawEvent(){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let x1 = parseFloat(document.getElementById('xCoord').value);
    let y1 = parseFloat(document.getElementById('yCoord').value);
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");
    let x2 = parseFloat(document.getElementById('xCoord2').value);
    let y2 = parseFloat(document.getElementById('yCoord2').value);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
  }

  function angleBetween(v1, v2) {
    let dot = Vector3.dot(v1, v2);
    let mag1 = v1.magnitude();
    let mag2 = v2.magnitude();
    if (mag1 === 0 || mag2 === 0) {
      console.log("Angle undefined (zero-length vector)");
      return;
    }
    let cosAlpha = dot / (mag1 * mag2);
    cosAlpha = Math.min(1, Math.max(-1, cosAlpha));

    let angleRad = Math.acos(cosAlpha);
    let angleDeg = angleRad * 180 / Math.PI;
    console.log("Angle:", angleDeg);
  }

  function areaTriangle(v1, v2) {
    let cross = Vector3.cross(v1, v2);
    let area = cross.magnitude() / 2;
    console.log("Area of triangle", area) 
  }

  function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let x1 = parseFloat(document.getElementById('xCoord').value);
    let y1 = parseFloat(document.getElementById('yCoord').value);
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");
    let x2 = parseFloat(document.getElementById('xCoord2').value);
    let y2 = parseFloat(document.getElementById('yCoord2').value);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");

    let op = document.getElementById('operation').value;
    let s = parseFloat(document.getElementById('scalar').value);

    if (op === "add") {
      let v3 = new Vector3(v1.elements);
      v3.add(v2);
      drawVector(v3, "green");

    } else if (op === "sub") {
      let v3 = new Vector3(v1.elements);
      v3.sub(v2);
      drawVector(v3, "green");

    } else if (op === "mul") {
      let v3 = new Vector3(v1.elements);
      let v4 = new Vector3(v2.elements);
      v3.mul(s);
      v4.mul(s);
      drawVector(v3, "green");
      drawVector(v4, "green");

    } else if (op === "div") { 
      let v3 = new Vector3(v1.elements);
      let v4 = new Vector3(v2.elements);
      v3.div(s);
      v4.div(s);
      drawVector(v3, "green");
      drawVector(v4, "green");
    
    } else if (op === "mag") {
      console.log("Mangitude of v1:", v1.magnitude());
      console.log("Magnitude of v2:", v2.magnitude());

    } else if (op === "norm") {
      let v3 = new Vector3(v1.elements);
      let v4 = new Vector3(v2.elements);

      v3.normalize();
      v4.normalize();
      
      drawVector(v3, "green");
      drawVector(v4, "green");

    } else if (op === "angle") {
      angleBetween(v1, v2);

    } else if (op === "area") {
      areaTriangle(v1, v2);
    }

  }
  

  function main() {  
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');  
    if (!canvas) { 
      console.log('Failed to retrieve the <canvas> element');
      return false; 
    } 

    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'black'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
