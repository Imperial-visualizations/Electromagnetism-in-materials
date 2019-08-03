//global constants
const xMin = -20;
const xMaxIncident = 20;
const IncidentAmplitude = 5;
const omega = 1;
const k = 1;

//REFLECTION & TRANSM shifted waves??, Add maths (amplit changes)


//TICKING CLOCK INIT AT GLOBAL LEVEL?!
let t = 0;

const IncidTransLayout = {
    title: "Incident Wave",
    showlegend: false,
    xaxis: {
        constrain: "domain",
        range: [xMin, xMaxIncident],
        showticklabels: false
    },
    yaxis: {
        range: [xMin, xMaxIncident],
        showticklabels: false,
    },
    margin: {
        l: 1, r: 1, b:30, t: 30, pad: 10
    }
}

function ReflectedWaveLayout(DielectricWidth){
    
    const GraphLayout = {
        autosize: true,
        // margin: {
        //     l: 30, r: 40, t: 30, b: 30
        // },
        hovermode: "closest",
        xaxis: {range: [xMin, DielectricWidth], zeroline: true, title: "d"},
        yaxis: {
            zeroline: false, showticklabels: true, tickmode: 'array',
            tickvals: [30, 60, 90, 120, 150, 180, 210, 240, 270,300],
            ticktext: ['n=0','n=1', 'n=2', 'n=3', 'n=4', 'n=5', 'n=6', 'n=7', 'n=8', 'n=9', 'n=10'],
            side: 'right'
        },
        aspectratio: {
            x: 1, y: 1
        }
    }

    return GraphLayout 
}

class Wave {

    constructor(type, dielectricWidth, reflectionCoeff, numberOfReflections){
        this.type = type;
        this.dielectricWidth = dielectricWidth;
        this.reflectionCoeff = reflectionCoeff;
        this.numberOfReflections = numberOfReflections;
        this.Layout = this.FindLayout();
        this.xData, this.yData = this.GenerateData();
    }

    FindLayout(){
        let layout = IncidTransLayout
        if (this.type == "reflected"){
            layout = ReflectedWaveLayout(this.dielectricWidth);
        }
        return layout;
    }

    GenerateData(){
        let amplitude = IncidentAmplitude;
        let xMax;
        let direction;
        switch (this.type){
            case "incident":
                xMax = xMaxIncident;
                direction = 1;
            case "reflected":
                xMax = this.dielectricWidth;
                direction = -1;
            case "transmitted":
                xMax = this.dielectricWidth;
                direction = 1;
        }

        let x = numeric.linspace(xMin, xMax, 50);
        let y = x.map(x1 => {
            amplitude * Math.cos(k*x1 - direction*omega*t)
        });

        return x, y;
    }

}

class Waves {

    constructor(DielectricWidth, ReflectionCoeff, NumberOfReflections){
         this.DielectricWidth = DielectricWidth;
         this.ReflectionCoeff = ReflectionCoeff;
         this.NumberOfReflections = NumberOfReflections;
         this.WavesArray = this.CreateWavesArray();
    }

    CreateWavesArray(){
        let IncidentWave = new Wave("incident", this.DielectricWidth, this.ReflectionCoeff, this.NumberOfReflections)
        let ReflectedWaves = new Wave("reflected", this.DielectricWidth, this.ReflectionCoeff, this.NumberOfReflections)
        let TransmittedWaves = new Wave("transmitted", this.DielectricWidth, this.ReflectionCoeff, this.NumberOfReflections)
        //return [IncidentWave, ReflectedWaves, TransmittedWaves]
        return [IncidentWave]
    }
}

function CreateDataLine(xData, yData) {
    let line = {
        x: xData,
        y: yData,
        type: "scatter",
        mode: "lines",
        line: {
            color: "rgb(0,0,0)",
            width: 3
        },
        showscale: false
    }
    
    return line;
}


function initialPlot(waves){
    console.log("called initialPlot");
    console.log(waves);

    waves.WavesArray.forEach(wave => {
        //console.log(wave.type);
        let DataLine = CreateDataLine(wave.xData, wave.yData);
        Plotly.purge(wave.type)
        Plotly.newPlot(wave.type, DataLine, wave.Layout);
    });
}

function update(waves) {
    console.log("called update");
    waves.WavesArray.forEach(wave => {
        let DataLine = CreateDataLine(wave.xData, wave.yData)
        Plotly.react(wave.type, DataLine, wave.Layout)
    });
}

function NextAnimationFrame(waves){
    t += 0.01;
    //console.log(1)
    waves.WavesArray.forEach(wave => {
        let DataLine = CreateDataLine(wave.xData, wave.yData)
        Plotly.animate(wave.type,
            {data: DataLine},
            {
                fromcurrent: true,
                transition: {duration: 0},
                frame: {duration: 0, redraw: false},
                mode: "immediate"
            });
    });
    //AnimateAllGraphs(waves)
}

function AnimateAllGraphs(waves){

    //TODO - BUG - TESTING FOR loop
    for (let i=0; i<=2; i++){
        window.requestAnimationFrame(function() {NextAnimationFrame(waves);})
    }
}

function main() {
    //initial
    let ReflectionCoeff = parseFloat($("#ReflectionCoeff").val());
    let DielectricWidth = parseFloat($("#DielectricWidth").val());
    let NumberOfReflections = parseFloat($("#NumberOfReflections").val());

    $("#ReflectionCoeffDisplay").text(ReflectionCoeff)
    $("#DielectricWidthDisplay").text(DielectricWidth)
    $("#NumberOfReflectionsDisplay").text(NumberOfReflections)

    let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);

    initialPlot(waves);
    //run using the default values of all the sliders
    update(waves);
    AnimateAllGraphs(waves);

    //check if correct!!! - wrapped NextAnimationFrame in anonym func for callback
    window.requestAnimationFrame( function() {NextAnimationFrame(waves);});
    
   //live update of slider display values and graphs
   $("input[type=range]").each(function () {
    $(this).on('input', function () {
        $("#" + $(this).attr("id") + "Display").text($(this).val());
        let ReflectionCoeff = $("#ReflectionCoeff").val();
        let DielectricWidth = $("#DielectricWidth").val();
        let NumberOfReflections = $("#NumberOfReflections").val();

        //t = 0
        let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);
        //update
        update(waves);
        AnimateAllGraphs(waves);

        });
    });
}

$(window).on("load", main())