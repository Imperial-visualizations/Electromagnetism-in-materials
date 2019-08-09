//global constants
const xMaxIncident = 20;
const IncidentAmplitude = 3;
const omega = 0.5;
const k = 1;

const xLayoutMin = -20;
const xLayoutMax = 100;

const yLayoutMin = -20;
const yLayoutMax = 20;

const resolution = 500;

const dielectricGraphDiv = "dielectricGraph";
const leftSumGraphDiv = "leftSumGraph";
const rightSumGraphDiv = "rightSumGraph";

const xMinBoundary = Array(resolution).fill(xMaxIncident);
const yBoundary = numeric.linspace(yLayoutMin, yLayoutMax, resolution)


//TICKING CLOCK INIT AT GLOBAL LEVEL?!
let t = 0;
//let isPlay = true;

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
            l: 0, r: 0, b:10, t: 10, pad: 0
        }
    }

    return layout
}

const SumGraphLayout = {
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


class Wave {

    constructor(type, amplitude, direction, offset, xMin, xMax){
        this.type = type;
        this.amplitude = amplitude;
        this.direction = direction;
        this.offset = offset;
        this.xMin = xMin;
        this.xMax = xMax;

        this.Data = this.GenerateData();
    }

    GenerateData(){
        let x = numeric.linspace(this.xMin, this.xMax, resolution);
        //console.log("xMin", xMin);
        let y = x.map(x1 => {
            return this.amplitude * Math.cos(k*x1 - this.direction*omega*t) + this.offset;
        });

        return [x, y];
    }

}

class Waves {

    constructor(DielectricWidth, ReflectionCoeff, NumberOfReflections){
         this.DielectricWidth = DielectricWidth;
         this.ReflectionCoeff = ReflectionCoeff;
         this.NumberOfReflections = NumberOfReflections;

         this.WavesArray = this.CreateWavesArray();

         //array [left, right]
         this.SumOfWavesArray = this.CreateSumWaves();
    }

    CreateWavesArray(){
        //type, dielectricWidth, amplitude, direction, offset
        //direction right = 1, left = -1
        //need IncidentWave in a nested array - doing this instead of having a separate property for incident (with wave at diff depth in array) saves having to write  code again and again with only slight differences
        return [[this.CreateIncidentWave()], this.CreateReflectedWaves(), this.CreateTransmittedWaves()];
    }

    CreateIncidentWave(){
        let xMin = 0;
        let xMax = xMaxIncident;
        let direction = 1;
        let offset = 15;
        let IncidentWave = new Wave("incident", IncidentAmplitude, direction, offset, xMin, xMax);
        return IncidentWave;
    }

    CreateReflectedWaves(){
        let xMin = xMaxIncident;
        let xMax = xMaxIncident + this.DielectricWidth;
        let r = this.ReflectionCoeff/100;
        let t = 1 - r;

        let ReflectedWaves = [];
        for (let i=0; i<this.NumberOfReflections; i++){
            let direction = (-1)**(i+1);
            let amplitude = (-1)**(i+1) * IncidentAmplitude * t * r**(i+1);
            let offset = 7 - 6*i;
            let ReflectedWave = new Wave("reflected", amplitude, direction, offset, xMin, xMax);
            ReflectedWaves.push(ReflectedWave);
        }
        return ReflectedWaves;
    }

    CreateSumWaves(){
        let r = this.ReflectionCoeff/100;
        let t = 1 - r;
        
        let LeftAmplitude = IncidentAmplitude;
        let RightAmplitude = 0;

        for (let i=0; i<this.NumberOfReflections; i++){
            RightAmplitude += IncidentAmplitude * t**2 * r**i;
            LeftAmplitude += -1 * IncidentAmplitude * t**2 * r**(1 + i*2);
        }

        let LeftWave = new Wave("leftSum", LeftAmplitude, 1, 0,0, 20);
        let RightWave = new Wave("rightSum", RightAmplitude, 1, 0, 0, 20);

        return [LeftWave, RightWave]
    }

    CreateTransmittedWaves(){
        let xMin;
        let xMax;
        let amplitude;
        let offset;
        let TransmittedWave;
        let r = this.ReflectionCoeff/100;
        let t = 1 - r;

        let TransmittedWaves = [];

        let InitialTransmittedWave = new Wave("transmitted", IncidentAmplitude*t, 1, 13, xMaxIncident, xMaxIncident+this.DielectricWidth);
        TransmittedWaves.push(InitialTransmittedWave);

        for (let i=0; i<this.NumberOfReflections; i++){
            //transmitted waves on the right
            xMin = xMaxIncident + this.DielectricWidth;
            xMax = xMin + xMaxIncident;

            amplitude = IncidentAmplitude * t**2 * r**i;
            offset = 10 - 6*i;
            TransmittedWave = new Wave("transmitted", amplitude, 1, offset, xMin, xMax);
            TransmittedWaves.push(TransmittedWave);

            //transmitted waves on the left
            xMin = 0;
            xMax = xMaxIncident;

            amplitude = -1 * IncidentAmplitude * t**2 * r**(1 + i*2);

            offset = 5 - 6*i;
            TransmittedWave = new Wave("transmitted", amplitude, -1, offset, xMin, xMax);
            TransmittedWaves.push(TransmittedWave);
        }
        return TransmittedWaves;
    }
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
        colour = "rgb(100,100,100)";
    }

    let line = {
                x: xData,
                y: yData,
                type: "scatter",
                mode: "lines",
                line: {
                    color: colour,
                    width: 3
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
            // Plotly.newPlot(wave.type);
            //Plotly.plot(dielectricGraphDiv, [DataLine], wave.Layout);
        });
    });
    return DataLines;
}

function initialPlot(waves){
    console.log("called initialPlot");

    let DataLines = CreateDataLines(waves)
    Plotly.newPlot(dielectricGraphDiv, DataLines, CreateLayout(waves.DielectricWidth));

    //Left Amplit Sum Graph
    let LeftSumWave = waves.SumOfWavesArray[0];
    let LeftDataLine = CreateDataLine(LeftSumWave.Data[0], LeftSumWave.Data[1], LeftSumWave.type);
    console.log("LeftDataLine", LeftDataLine);
    Plotly.newPlot(leftSumGraphDiv, LeftDataLine, SumGraphLayout);

    //Right Amplit Sum Graph
    let RightSumWave = waves.SumOfWavesArray[1];
    let RightDataLine = CreateDataLine(RightSumWave.Data[0], RightSumWave.Data[1], RightSumWave.type);
    console.log("RightDataLine", RightDataLine);
    Plotly.newPlot(rightSumGraphDiv, RightSumWave, SumGraphLayout);

    
}

function update(waves) {
    console.log("called update");
    
    let DataLines = CreateDataLines(waves)

    Plotly.react(dielectricGraphDiv, DataLines, CreateLayout(waves.DielectricWidth));
}

function NextAnimationFrame(DielectricWidth, ReflectionCoeff, NumberOfReflections){
    t += 0.2;
    let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections)

    let DataLines = CreateDataLines(waves);

    Plotly.animate(dielectricGraphDiv,
        {data: DataLines},
        {
            fromcurrent: true,
            transition: {duration: 0},
            frame: {duration: 0, redraw: false},
            mode: "immediate"
        });
    
    //FOR TESTING ONLY - do not use infinite call stack in final version!

    AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);
}

function AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections){

    window.requestAnimationFrame(function() {
        NextAnimationFrame(DielectricWidth, ReflectionCoeff, NumberOfReflections);
    });
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

    AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);
    
   //live update of slider display values and graphs
    // $("#PlayButton").on("click", function() {
    //     $("#PlayButton").value = (isPlay) ? "Play" : "Stop";
    //     //toggle
    //     isPlay = ! isPlay;
    //     AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);
    // })


   $("input[type=range]").each(function () {
    $(this).on('input', function () {
        $("#" + $(this).attr("id") + "Display").text($(this).val());
        let ReflectionCoeff = parseFloat($("#ReflectionCoeff").val());
        let DielectricWidth = parseFloat($("#DielectricWidth").val());
        let NumberOfReflections = parseInt($("#NumberOfReflections").val());

        let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);
        //t = 0

        update(waves);
        //AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);

        });
    });
}


$(window).on("load", main);