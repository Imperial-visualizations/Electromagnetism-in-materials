const ionNum = 20;
var xPlus = [];
var yPlus = [];
var zPlus = [];
var xMinus = [];
var yMinus = [];
var zMinus = [];

var layout = {
    scene:{
        //prevents weird resizing of axes when animating
        aspectmode:'cube',

        xaxis: {
            range: [-0.1,1.1],
        },
        yaxis: {
            range: [-0.1,1.1],
        },
        zaxis: {
            range:[-0.1,1.1],
        },

        //no margins on plot
        margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
        }
}};

function createInitialPositions(){
    let i = 0;

    while(i<ionNum){
        randint = Math.random();
        xPlus.push(randint);
        yPlus.push(Math.random());
        zPlus.push(Math.random());
        xMinus.push(Math.random());
        yMinus.push(Math.random());
        zMinus.push(Math.random());
        i++
    }

};

function initialPlot(){
    var Pos = {
        x:xPlus, y: yPlus, z: zPlus,
        mode: 'markers',
        name: 'Positive ions',
        marker: {
            color: 'rgb(0, 255, 0)',
            size: 12,
            line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5},
            opacity: 0.8},
        type: 'scatter3d'
    };

    var Neg = {
        x:xMinus, y: yMinus, z: zMinus,
        mode: 'markers',
        name: 'negative ions',
        marker: {
            color: 'rgb(255, 0, 0)',
            size: 5,
            symbol: 'circle',
            line: {
            color: 'rgb(204, 204, 204)',
            width: 1},
            opacity: 0.8},
        type: 'scatter3d'
    };

    var data = [Pos, Neg];

    Plotly.newPlot('plot', data, layout);
}

let t = 0;
let xMinusAnimated = [];
function oscillate(){

    //create displacement for electrons (SHM)
    disp = 0.05*Math.sin(0.1*t);
    t++;
    xMinusAnimated = [];

    for(let i = 0; i < xMinus.length; i++){
        xMinusAnimated.push(xMinus[i] + disp);
    }

    let Pos = {
        x:xPlus, y: yPlus, z: zPlus,
        mode: 'markers',
        name: 'Positive ions',
        marker: {
            color: 'rgb(0, 255, 0)',
            size: 12,
            line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5},
            opacity: 0.8},
        type: 'scatter3d'
    };

    let Neg = {
        x:xMinusAnimated, y: yMinus, z: zMinus,
        mode: 'markers',
        name: 'negative ions',
        marker: {
            color: 'rgb(255, 0, 0)',
            size: 5,
            symbol: 'circle',
            line: {
            color: 'rgb(204, 204, 204)',
            width: 1},
            opacity: 0.8},
        type: 'scatter3d'
    };

    let data = [Pos, Neg];
    return data;

};

function animatePlot(xMinusAnimated){
    if(Animate === true){
    Plotly.animate("plot",
            {data: oscillate()},//updated data
            {
                fromcurrent: false,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: true,},
                mode: "immediate"
            }
        );

    requestAnimationFrame(animatePlot);
    }
    return 0;
}

//Create initial plot and find positions
createInitialPositions();
initialPlot();

let Animate = false;
//If button pressed Animate Plot
$('#buttonPlay').on('click', function() {
    Animate = !Animate;

    //update button text
    if(Animate){$('#buttonPlay').html('Pause');}
    else{$('#buttonPlay').html('Play');}

    //start animation
    animatePlot();

})
