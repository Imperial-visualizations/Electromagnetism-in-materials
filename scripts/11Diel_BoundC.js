//global constants
const xMaxIncident = 20;
const IncidentAmplitude = 3;
const lamda = 50; //units???
const omega = 0.5;

const k1 =2*Math.PI/lamda;
const k2 = k1*1.5;

const xLayoutMin = -20;
const xLayoutMax = 100;

const yLayoutMin = -20;
const yLayoutMax = 20;

const resolution = 250;

const dielectricGraphDiv = "dielectricGraph";
const leftSumGraphDiv = "leftSumGraph";
const rightSumGraphDiv = "rightSumGraph";

const xMinBoundary = Array(resolution).fill(xMaxIncident);
const yBoundary = numeric.linspace(yLayoutMin, yLayoutMax, resolution)


//TICKING CLOCK INIT AT GLOBAL LEVEL?!
let t = 0;

let OldNumberOfReflections = parseInt($("#NumberOfReflections").val());

function CreateLayout(DielectricWidth){

    let layout = {
        showlegend: false,
        shapes: [{
            type: "rect",
            xref: "x",
            yref: "paper",
            x0: xMaxIncident,
            y0: 0,
            x1: xMaxIncident + DielectricWidth,
            y1: 1,
            fillcolor: '#d3d3d3',
            opacity: 0.4,
            line: {
                width: 0
            }
        }],
        xaxis: {
            zeroline: false,
            showgrid: false,
            constrain: "domain",
            range: [xLayoutMin, xLayoutMax],
            showticklabels: false
            
        },
        yaxis: {
            zeroline: false,
            showgrid: false,
            range: [yLayoutMin, yLayoutMax],
            showline: false
        },
        margin: {
            l: 0, r: 0, b:10, t: 10, pad: 2
        }
    }

    return layout
}

const LeftSumGraphLayout = {
    showlegend: false,

    xaxis: {
        zeroline: false,
        showgrid: false,
        constrain: "domain",
        range: [0,20],
        showline: false
    },

    yaxis: {
        zeroline: false,
        showgrid: false,
        range: [-20,20],
        showline: false
    },

    margin: {
        l: 0, r: 0, b:0, t:0, pad:0
    }
}

const RightSumGraphLayout = {
    showlegend: false,

    xaxis: {
        zeroline: false,
        showgrid: false,
        constrain: "domain",
        range: [0,20],
        showline: false
    },

    yaxis: {
        zeroline: false,
        showgrid: false,
        range: [-20,20],
        showline: false
    },

    margin: {
        l: 0, r: 30, b:0, t:0, pad:0
    }
}


class Wave {

    constructor(type, amplitude, direction, offset, xMin, xMax, k){
        this.type = type;
        this.amplitude = amplitude;
        this.direction = direction;
        this.offset = offset;
        this.xMin = xMin;
        this.xMax = xMax;
        this.k = k;

        this.Data = this.GenerateData();
    }

    GenerateData(){
        let x = numeric.linspace(this.xMin, this.xMax, resolution);
        //console.log("xMin", xMin);
        let y = x.map(x1 => {
            return this.amplitude * Math.cos(this.k*x1 - this.direction*omega*t) + this.offset;
        });

        return [x, y];
    }

}

class Waves {

    constructor(DielectricWidth, ReflectionCoeff, NumberOfReflections){
         this.DielectricWidth = DielectricWidth;
         this.ReflectionCoeff = ReflectionCoeff;
         this.NumberOfReflections = NumberOfReflections;

         //old structure [ [incid], [refl, ...], [init_transm_in_diel], [transm_left, ...], [transm_right, ...] ]
         //new structure [ [incid], [refl_in_vac], [init_transm_in_diel], [transm_left, ...], [transm_right, ...] ]
         this.WavesArray = this.CreateWavesArray();
    }

    CreateWavesArray(){
        //type, dielectricWidth, amplitude, direction, offset
        //direction right = 1, left = -1
        //need IncidentWave in a nested array - doing this instead of having a separate property for incident (with wave at diff depth in array) saves having to write  code again and again with only slight differences
        let TransmittedWaves = this.CreateTransmittedWaves();
        let ReflectedWaves = this.CreateReflectedWaves();
        return [[this.CreateIncidentWave()], ReflectedWaves[1], TransmittedWaves[0], TransmittedWaves[1], TransmittedWaves[2], ReflectedWaves[0]];
    }

    CreateIncidentWave(){
        let xMin = 0;
        let xMax = xMaxIncident;
        let direction = 1;
        let offset = 16.5;
        let IncidentWave = new Wave("incident", IncidentAmplitude, direction, offset, xMin, xMax, k1);
        return IncidentWave;
    }

    CreateReflectedWaves(){
        let xMin = xMaxIncident;
        let xMax = xMaxIncident + this.DielectricWidth;
        let r = this.ReflectionCoeff/100;
        let t = 1 - r;

        let ReflectedWaveInVacuum = new Wave("reflected", IncidentAmplitude*r, -1, 12, 0, xMaxIncident, k1);

        let ReflectedWaves = [];
        for (let i=0; i<this.NumberOfReflections; i++){
            let direction = (-1)**(i+1);
            let amplitude = (-1)**(i+1) * IncidentAmplitude * t * r**(i+1);
            let offset = 7 - 4*i;
            let ReflectedWave = new Wave("reflected", amplitude, direction, offset, xMin, xMax, k2);
            ReflectedWaves.push(ReflectedWave);
        }
        return [[ ReflectedWaveInVacuum ], ReflectedWaves ];
    }


    CreateTransmittedWaves(){
        let xMin;
        let xMax;
        let amplitude;
        let offset;
        let r = this.ReflectionCoeff/100;
        let t = 1 - r;

        let TransmittedWavesLeft = [];
        let TransmittedWavesRight = [];
    
        let TransmittedWaves = [];

        //initial transmitted wave in dielectric so needs to be incl as edge case
        let InitialTransmittedWave = new Wave("transmitted", IncidentAmplitude*t, 1, 12, xMaxIncident, xMaxIncident+this.DielectricWidth, k2);
        //TransmittedWaves.push(InitialTransmittedWave);

        for (let i=0; i<this.NumberOfReflections; i+=2){
            //transmitted waves on the right
            xMin = xMaxIncident + this.DielectricWidth;
            xMax = xMin + xMaxIncident;

            //TODO - WRONG????
            amplitude = IncidentAmplitude * t**2 * r**i;
            //amplitude = IncidentAmplitude

            offset = 9 - 4*i;
            let TransmittedWaveRight = new Wave("transmitted", amplitude, 1, offset, xMin, xMax, k2);
            TransmittedWavesRight.push(TransmittedWaveRight);

            //transmitted waves on the left
            xMin = 0;
            xMax = xMaxIncident;

            amplitude = -1 * IncidentAmplitude * t**2 * r**(1 + i*2);
            //amplitude = -1 * IncidentAmplitude //* t**2 * r**(1 + i*2);

            offset = 5 - 4*(i);
            let TransmittedWaveLeft = new Wave("transmitted", amplitude, -1, offset, xMin, xMax, k1);
            TransmittedWavesLeft.push(TransmittedWaveLeft);
        }

        TransmittedWaves = [[InitialTransmittedWave], TransmittedWavesLeft, TransmittedWavesRight];

        return TransmittedWaves;
    }
}

function FindSumWaveData(waves){
    let x = numeric.linspace(0,20,resolution);
    let yLeft = waves.WavesArray[0][0].Data[1]; //incid data
    let yRight = Array(resolution).fill(0); //initially zeros

    for (let waveIndex=0; waveIndex<waves.WavesArray[2].length; waveIndex++){

        let offsetLeft = waves.WavesArray[3][waveIndex].offset;
        let offsetRight = waves.WavesArray[4][waveIndex].offset;

        yLeft = yLeft.map(function(num, yindex){
            return num + waves.WavesArray[3][waveIndex].Data[1][yindex] - offsetLeft - 16;
        });

        yRight = yRight.map(function(num, yindex){
            return num + waves.WavesArray[4][waveIndex].Data[1][yindex] - offsetRight;
        });
        
    }

    //console.log("yLeft", yLeft);

    //[left data, right data]
    return [ [x, yLeft], [x, yRight] ];
}

function CreateDataLine(xData, yData, type) {
    let colour;

    if (type === "incident"){
        colour = "rgb(100,100,100)";
    } else if (type === "reflected"){
        colour = "rgb(200,0,0)";
    } else if (type === "transmitted"){
        colour = "rgb(0,0,200)";
    } else if (type === "boundary"){
        colour = "rgb(200,200,200)"
    } else {
        colour = "rgb(200,100,200)";
    }

    let line = {
                x: xData,
                y: yData,
                type: "scatter",
                mode: "lines",
                line: {
                    color: colour,
                    width: 2
                },
                showscale: true
                };
    
    return line;
}

function CreateDataLines(waves){
    let DataLines = [];

    //Boundary Lines

    // let MinBoundaryLine = CreateDataLine(xMinBoundary, yBoundary, "boundary");
    // DataLines.push(MinBoundaryLine);

    // let xMaxBoundary = Array(resolution).fill(xMaxIncident + waves.DielectricWidth);
    // let MaxBoundaryLine = CreateDataLine(xMaxBoundary, yBoundary, "boundary");
    // DataLines.push(MaxBoundaryLine);

    waves.WavesArray.forEach(SetOfWaves => {
        //console.log("SetOfWaves", SetOfWaves);
        SetOfWaves.forEach(wave => {
            //console.log(wave);
            let DataLine = CreateDataLine(wave.Data[0], wave.Data[1], wave.type);
            DataLines.push(DataLine);
        });
    });
    return DataLines;
}

function initialPlot(waves){
    console.log("called initialPlot");

    let DataLines = CreateDataLines(waves)
    Plotly.newPlot(dielectricGraphDiv, DataLines, CreateLayout(waves.DielectricWidth));

    //Left Amplit Sum Graph

    let SumWaveData = FindSumWaveData(waves);

    let LeftDataLine = CreateDataLine(SumWaveData[0][0], SumWaveData[0][1], "sum");

    console.log("LeftDataLine", LeftDataLine);
    Plotly.newPlot(leftSumGraphDiv, [LeftDataLine], LeftSumGraphLayout);

    //Right Amplit Sum Graph
    //let RightSumWaveData = waves.SumOfWavesArray[1];
    let RightDataLine = CreateDataLine(SumWaveData[1][0], SumWaveData[1][1], "sum");
    
    console.log("RightDataLine", RightDataLine);
    Plotly.newPlot(rightSumGraphDiv, [RightDataLine], RightSumGraphLayout);

    
}

function update(waves) {
    console.log("called update");
    
    let DataLines = CreateDataLines(waves)

    Plotly.react(dielectricGraphDiv, DataLines, CreateLayout(waves.DielectricWidth));
}

function NextAnimationFrame(DielectricWidth, ReflectionCoeff, NumberOfReflections){
    t += 0.2;
    let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections)

    Plotly.animate(dielectricGraphDiv,
        {
            data: CreateDataLines(waves),
            layout: CreateLayout(waves.DielectricWidth)
        },
        {
            fromcurrent: true,
            transition: {duration: 0},
            frame: {duration: 0, redraw: false},
            mode: "immediate"
        });
    
    let WaveData = FindSumWaveData(waves)
    let LeftSumWaveData = WaveData[0];
    let LeftSumDataLine = CreateDataLine(LeftSumWaveData[0], LeftSumWaveData[1], "sum");
    //console.log("LeftSumDataLine", LeftSumDataLine);

    Plotly.animate(leftSumGraphDiv,
        {
            data: [LeftSumDataLine],
            layout: LeftSumGraphLayout
        },
        {
            fromcurrent: true,
            transition: {duration: 0},
            frame: {duration: 0, redraw: false},
            mode: "immediate"
        });

    let RightSumWaveData = WaveData[1];
    let RightSumDataLine = CreateDataLine(RightSumWaveData[0], RightSumWaveData[1], "sum");
    //console.log(RightSumDataLine);
    Plotly.animate(rightSumGraphDiv,
        {
            data: [RightSumDataLine],
            layout: RightSumGraphLayout
        },
        {
            fromcurrent: true,
            transition: {duration: 0},
            frame: {duration: 0, redraw: false},
            mode: "immediate"
        });
    
    //FOR TESTING ONLY - do not use infinite call stack in final version!

    AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);
}

function AnimateAllGraphs(){
       //cannot pass these as arguments - need to avoid two contradictory infinite call stacks
    let ReflectionCoeff = parseFloat($("#ReflectionCoeff").val());
    let DielectricWidth = parseFloat($("#DielectricWidth").val());
    let NumberOfReflections = parseInt($("#NumberOfReflections").val());

    t += 0.2;

    let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);

    //only update if there has been a change
    //don't use jquery on-change as its async and may cause problems
    if (waves.WavesArray[1].length != OldNumberOfReflections) {
        update(waves);
        OldNumberOfReflections = NumberOfReflections;
        window.requestAnimationFrame(function() {
            NextAnimationFrame(waves);
        });
    } else {
        window.requestAnimationFrame(function() {
            NextAnimationFrame(waves);
        });
    }
}

function main() {
    //initial
    let ReflectionCoeff = parseFloat($("#ReflectionCoeff").val());
    let DielectricWidth = parseFloat($("#DielectricWidth").val());
    let NumberOfReflections = parseInt($("#NumberOfReflections").val());

    $("#ReflectionCoeffDisplay").text(ReflectionCoeff);
    $("#DielectricWidthDisplay").text(DielectricWidth);
    $("#NumberOfReflectionsDisplay").text(NumberOfReflections);

    let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);

    initialPlot(waves);

    //Comment to disable animation
    AnimateAllGraphs();


   $("input[type=range]").each(function () {
    $(this).on('input', function () {
        $("#" + $(this).attr("id") + "Display").text($(this).val());
        $("#TETCDisplay").text()

        //UNCOMMENT FOR STATIC BUT UPDATING PLOTS

        // let ReflectionCoeff = parseFloat($("#ReflectionCoeff").val());
        // let DielectricWidth = parseFloat($("#DielectricWidth").val());
        // let NumberOfReflections = parseInt($("#NumberOfReflections").val());

        // let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);

        // // Uses newPlot - for debugging only
        // initialPlot(waves);
        });
    });
}


$(window).on("load", main);