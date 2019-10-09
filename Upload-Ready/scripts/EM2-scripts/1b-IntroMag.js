let cubeSize = 70;
let prePos = [[0, 0, 0]];
let cubeList = [];
let cubeFace = [];
let onValue = 1;
let EMag = 100;
let sN = 1;

//sliders input and display:

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

function toggleButtonText() {
    if (document.querySelectorAll('#showN-text')[0].innerHTML === 'Show') {
        document.querySelectorAll('#showN-text')[0].innerHTML = 'Hide';
    } else {
        document.querySelectorAll('#showN-text')[0].innerHTML = 'Show';
    }
}

function setup() {
    let C = createCanvas(document.querySelectorAll("#sketch-holder")[0].offsetWidth, document.querySelectorAll("#sketch-holder")[0].offsetWidth, WEBGL);
    C.parent('sketch-holder');
    frameRate(60);
}

function checkArray(a, b, c, list) {
    let match = false;
    let index = -100;
    for (i = 0; i < list.length; i++) {
        if (a == list[i][0]) {
            if (b == list[i][1]) {
                if (c == list[i][2]) {
                    match = true;
                    index = i;
                    break;
                    //console.log(i)
                }
            }
        }
    }
    return [match, index];

}

class EFieldLine {
    constructor(x = 0, y = 0, z = 0, Ry = 0, Rz = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.Ry = Ry;
        this.Rz = Rz;
    }

    DrawLine() {
        push();
        //strokeWeight(5);
        stroke('rgba(147, 236, 59, 0.7)');
        //rotateX(this.Rx);
        //rotateY(this.Ry);
        //rotateZ(this.Rz);
        line(this.x, this.y, this.z, this.x + EMag * Math.sin(this.Ry) * Math.cos(this.Rz), this.y + EMag * Math.sin(this.Ry) * Math.sin(this.Rz), this.z + EMag * Math.cos(this.Ry));
        pop();
        push();
        noStroke();
        fill('rgba(147, 236, 59, 0.7)');
        translate(this.x + EMag * Math.sin(this.Ry) * Math.cos(this.Rz), this.y + EMag * Math.sin(this.Ry) * Math.sin(this.Rz), this.z + EMag * Math.cos(this.Ry));
        //sphere(3);
        //cone(10,10);

        rotateZ(this.Rz);
        rotateY(this.Ry);
        rotateZ(-this.Rz);


        beginShape();
        vertex(5, 5, 0);
        vertex(0, 0, 8);
        vertex(5, -5, 0);
        endShape();
        beginShape();
        vertex(5, -5, 0);
        vertex(0, 0, 8);
        vertex(-5, -5, 0);
        endShape();
        beginShape();
        vertex(-5, -5, 0);
        vertex(0, 0, 8);
        vertex(-5, 5, 0);
        endShape();
        beginShape();
        vertex(-5, 5, 0);
        vertex(0, 0, 8);
        vertex(5, 5, 0);
        endShape();

        pop()
    }
}

let linePos = [];
for (let i = -200; i <= 200; i = i + 200) {
    for (let n = -200; n <= 200; n = n + 200) {
        for (let m = -200; m <= 200; m = m + 200) {
            linePos.push([i, n, m]);
        }
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

    posFace() {
        let faceList = [[this.x, this.y, this.z + (cubeSize / 2 + 1), "right"], [this.x, this.y, this.z - (cubeSize / 2 + 1), "left"], [this.x + (cubeSize / 2 + 1), this.y, this.z, "front"], [this.x - (cubeSize / 2 + 1), this.y, this.z, "back"], [this.x, this.y + (cubeSize / 2 + 1), this.z, "top"], [this.x, this.y - (cubeSize / 2 + 1), this.z, "bottom"]];

        for (let i = 0; i < faceList.length; i++) {
            let match = checkArray(faceList[i][0], faceList[i][1], faceList[i][2], cubeFace);
            //console.log(match);
            if (match[0] === true) {
                cubeFace.splice(match[1], 1);
            } else {
                cubeFace.push(faceList[i]);
                //console.log("111")
            }
        }

    }

    drawFace() {
        for (let i = 0; i < cubeFace.length; i++) {
            let n = [0, 0, 0];
            push();
            stroke("green");
            //fill("red");
            //console.log(cubeFace[i]);
            translate(cubeFace[i][0], cubeFace[i][1], cubeFace[i][2]);
            if (cubeFace[i][3] === "left") {
                n = [0, 0, 1];
                //rotateZ(-Math.pi)
            } else if (cubeFace[i][3] === "right") {
                n = [0, 0, -1];
                //rotateZ(0)
            } else if (cubeFace[i][3] === "back") {
                n = [1, 0, 0];
                //rotateY(Math.PI / 2)
            } else if (cubeFace[i][3] === "front") {
                n = [-1, 0, 0];
                //rotateY(-Math.PI / 2)
            } else if (cubeFace[i][3] === "bottom") {
                n = [0, 1, 0];
                //rotateX(Math.PI / 2)
            } else {
                n = [0, -1, 0];
                //rotateX(-Math.PI / 2)
            }

            let M = [Math.sin(YsliderVal * (Math.PI / 180)) * Math.cos(ZsliderVal * (Math.PI / 180)), Math.sin(YsliderVal * (Math.PI / 180)) * Math.sin(ZsliderVal * (Math.PI / 180)), Math.cos(YsliderVal * (Math.PI / 180))];
            let J = [(M[1] * n[2] - M[2] * n[1]), -(M[0] * n[2] - M[2] * n[0]), (M[0] * n[1] - M[1] * n[0])];


            line(-J[0] * 20, -J[1] * 20, -J[2] * 20, J[0] * 20, J[1] * 20, J[2] * 20);

            push();
            stroke("red");
            //strokeWeight(5)
            line(J[0] * 20, J[1] * 20, J[2] * 20, (J[0] + J[0] / 3) * 20, (J[1] + J[1] / 3) * 20, (J[2] + J[2] / 3) * 20);
            pop();
            //console.log(J);
            pop();


            if (sN == 0) {
                push();
                stroke("black");
                translate(cubeFace[i][0], cubeFace[i][1], cubeFace[i][2]);
                if (cubeFace[i][3] === "right") {
                    line(0, 0, 0, 0, 0, 10);
                } else if (cubeFace[i][3] === "left") {
                    line(0, 0, 0, 0, 0, -10);
                } else if (cubeFace[i][3] === "front") {
                    line(0, 0, 0, 10, 0, 0);
                } else if (cubeFace[i][3] === "back") {
                    line(0, 0, 0, -10, 0, 0);
                } else if (cubeFace[i][3] === "top") {
                    line(0, 0, 0, 0, 10, 0);
                } else {
                    line(0, 0, 0, 0, -10, 0);
                }
                pop()
            }
        }
        //console.log(cubeFace)
    }

    //draw faces as another function. Each cube has 6 sides with a position of center. Position of center is in an array. When new cube is constructed, if new center cube side already exist in array, delete new and previous side (EG. set view=false), DONT DELETE CENTER POS
}

function showN() {
    if (sN == 1) {
        sN = 0;
    } else {
        sN = 1
    }
}

function move_X() {
    let a = prePos[prePos.length - 1][0] - (cubeSize + 2);
    let b = prePos[prePos.length - 1][1];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray(a, b, c, prePos);
    if (n[0] === false) {
        prePos.push([a, b, c]);
        onValue = 1;
    }
}

function move_Y() {
    let a = prePos[prePos.length - 1][1] + (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray(b, a, c, prePos);
    if (n[0] === false) {
        prePos.push([b, a, c]);
        onValue = 1;
    }
}

function movePlusX() {
    let a = prePos[prePos.length - 1][0] + (cubeSize + 2);
    let b = prePos[prePos.length - 1][1];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray(a, b, c, prePos);
    if (n[0] === false) {
        prePos.push([a, b, c]);
        onValue = 1;
    }
}

function movePlusY() {
    let a = prePos[prePos.length - 1][1] - (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][2];
    let n = checkArray(b, a, c, prePos);
    if (n[0] === false) {
        prePos.push([b, a, c]);
        onValue = 1;
    }
}

function move_Z() {
    let a = prePos[prePos.length - 1][2] - (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][1];
    let n = checkArray(b, c, a, prePos);
    if (n[0] === false) {
        prePos.push([b, c, a]);
        onValue = 1;
    }
}

function movePlusZ() {
    let a = prePos[prePos.length - 1][2] + (cubeSize + 2);
    let b = prePos[prePos.length - 1][0];
    let c = prePos[prePos.length - 1][1];
    let n = checkArray(b, c, a, prePos);
    if (n[0] === false) {
        prePos.push([b, c, a]);
        onValue = 1;
    }
}

function deleteCube() {
    prePos = [[0, 0, 0]];
    cubeList = [];
    cubeFace = [];
    let cube = new element();
    cubeList.push(cube);
    cube.posFace();
    cube.drawElement();
    cube.drawFace();
}


function draw() {

    clear();
    background("white");
    orbitControl();
    strokeWeight(3);
    push();
    stroke('rgba(0, 0, 0, 0.7)');
    line(-300, 0, 0, 300, 0, 0);
    line(0, -300, 0, 0, 300, 0);
    line(0, 0, -300, 0, 0, 300);
    pop();

    push();
    stroke("green");
    line(prePos[prePos.length - 1][0], prePos[prePos.length - 1][1], prePos[prePos.length - 1][2], prePos[prePos.length - 1][0] + 50, prePos[prePos.length - 1][1], prePos[prePos.length - 1][2]);
    pop();
    push();
    stroke("red");
    line(prePos[prePos.length - 1][0], prePos[prePos.length - 1][1], prePos[prePos.length - 1][2], prePos[prePos.length - 1][0], prePos[prePos.length - 1][1] - 50, prePos[prePos.length - 1][2]);
    pop();
    push();
    stroke("blue");
    line(prePos[prePos.length - 1][0], prePos[prePos.length - 1][1], prePos[prePos.length - 1][2], prePos[prePos.length - 1][0], prePos[prePos.length - 1][1], prePos[prePos.length - 1][2] + 50);
    pop();

    //console.log(prePos);
    if (onValue == 1) {
        let cube = new element(prePos[prePos.length - 1][0], prePos[prePos.length - 1][1], prePos[prePos.length - 1][2]);
        cubeList.push(cube);
        cube.posFace();
    }

    for (let i = 0; i < cubeList.length; i++) {
        cubeList[i].drawElement();
        cubeList[i].drawFace();
    }

    for (let i = 0; i < linePos.length; i++) {
        let line = new EFieldLine(linePos[i][0], linePos[i][1], linePos[i][2], YsliderVal * (Math.PI / 180), ZsliderVal * (Math.PI / 180));
        line.DrawLine();
    }
    //console.log(cubeFace);
    onValue = 0;
}