let cubeSize = 75;
let prePos = [[0, 0, 0]];
let cubeList = [];
let onValue = 1;

//sliders input and display:
let X_slider = document.getElementById("XRot");
let X_slider_val = document.getElementById("XRot_Val");

X_slider_val.innerHTML = X_slider.value;
let XsliderVal = 0;

X_slider.oninput = function () {
    X_slider_val.innerHTML = this.value;
    XsliderVal = this.value;
};

let Y_slider = document.getElementById("YRot");
let Y_slider_val = document.getElementById("YRot_Val");

Y_slider_val.innerHTML = Y_slider.value;
let YsliderVal = 0;

Y_slider.oninput = function () {
    Y_slider_val.innerHTML = this.value;
    YsliderVal = this.value;
};

let Z_slider = document.getElementById("ZRot");
let Z_slider_val = document.getElementById("ZRot_Val");

Z_slider_val.innerHTML = Z_slider.value;
let ZsliderVal = 0;

Z_slider.oninput = function () {
    Z_slider_val.innerHTML = this.value;
    ZsliderVal = this.value;
};

function setup() {
    let C = createCanvas(windowWidth / 1.7, windowWidth / 1.7, WEBGL);
    C.parent('sketch-holder');
    frameRate(60);
}

class EFieldLine{
    constructor(y=0,z=0,Rx=0,Ry=0,Rz=0) {
        this.x=300;
        this.y=y;
        this.z=z;
        this.Rx=Rx;
        this.Ry=Ry;
        this.Rz=Rz;
    }

    DrawLine() {
        push();
        //strokeWeight(5);
        stroke('rgba(17, 161, 238, 0.45)');
        rotateX(this.Rx);
        rotateY(this.Ry);
        rotateZ(this.Rz);
        line(this.x,this.y,this.z,-this.x,this.y,this.z);
        pop();
    }
}

let linePos=[];
for (i=-300;i<=300;i=i+100) {
    for (n=-300;n<=300;n=n+100) {
        linePos.push([i,n]);
    }
}


class element {
    constructor(x = 0, y = 0, z = 0, p = 1, e = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.p = p;
        this.e = e;
    }

    drawElement() {
        push();
        translate(this.x, this.y, this.z);
        //stroke("black");
        noStroke();
        fill(200, 200, 200);
        box(cubeSize);
        pop();
    }
}

function checkArray([a, b, c]) {
    let match = false;
    for (i = 0; i < prePos.length; i++) {
        if (prePos[i][0] == a) {
            if (prePos[i][1] == b) {
                if (prePos[i][2] == c) {
                    match = true;
                    break;
                }
            }
        }
    }
    return match;

}

function move_X() {
    let a = prePos[prePos.length - 1][0] - (cubeSize + 2);
    let b = prePos[prePos.length - 1][1];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray([a, b, c]);
    if (n === false) {
        prePos.push([a, b, c]);
        onValue = 1;
    }
}

function move_Y() {
    let a = prePos[prePos.length - 1][1] + (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray([b, a, c]);
    if (n === false) {
        prePos.push([b, a, c]);
        onValue = 1;
    }
}

function movePlusX() {
    let a = prePos[prePos.length - 1][0] + (cubeSize + 2);
    let b = prePos[prePos.length - 1][1];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray([a, b, c]);
    if (n === false) {
        prePos.push([a, b, c]);
        onValue = 1;
    }
}

function movePlusY() {
    let a = prePos[prePos.length - 1][1] - (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray([b, a, c]);
    if (n === false) {
        prePos.push([b, a, c]);
        onValue = 1;
    }
}

function move_Z() {
    let a = prePos[prePos.length - 1][2] - (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][1];
    let n = checkArray([b, c, a]);
    if (n === false) {
        prePos.push([b, c, a]);
        onValue = 1;
    }
}

function movePlusZ() {
    let a = prePos[prePos.length - 1][2] + (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][1];
    let n = checkArray([b, c, a]);
    if (n === false) {
        prePos.push([b, c, a]);
        onValue = 1;
    }
}

function deleteCube() {
    if (cubeList.length > 1) {
        cubeList.pop();
        prePos.pop();
    }
}

function draw() {
    clear();
    background("white");
    orbitControl();
    strokeWeight(3);
    push();
    stroke('rgba(0, 0, 0, 0.7)');
    line(-300,0,0,300,0,0);
    line(0,-300,0,0,300,0);
    line(0,0,-300,0,0,300);
    pop();

    push();
    stroke("green");
    line(prePos[prePos.length-1][0], prePos[prePos.length-1][1], prePos[prePos.length-1][2],prePos[prePos.length-1][0]+100, prePos[prePos.length-1][1], prePos[prePos.length-1][2]);
    pop();
    push();
    stroke("red");
    line(prePos[prePos.length-1][0], prePos[prePos.length-1][1], prePos[prePos.length-1][2],prePos[prePos.length-1][0], prePos[prePos.length-1][1]-100, prePos[prePos.length-1][2]);
    pop();
    push();
    stroke("blue");
    line(prePos[prePos.length-1][0], prePos[prePos.length-1][1], prePos[prePos.length-1][2],prePos[prePos.length-1][0], prePos[prePos.length-1][1], prePos[prePos.length-1][2]+100);
    pop();

    //console.log(prePos);
    if (onValue == 1) {
        let cube = new element(prePos[prePos.length - 1][0], prePos[prePos.length - 1][1], prePos[prePos.length - 1][2]);
        cubeList.push(cube);
    }

    for (i=0;i<linePos.length;i++){
        let line=new EFieldLine(linePos[i][0],linePos[i][1],XsliderVal*(Math.PI/180),YsliderVal*(Math.PI/180),ZsliderVal*(Math.PI/180));
        line.DrawLine();
    }
    for (i = 0; i < cubeList.length; i++) {
        cubeList[i].drawElement()
    }
    onValue = 0;
}