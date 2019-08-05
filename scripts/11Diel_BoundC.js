//global constants
const xMin = -20;
const xMaxIncident = 20;
const IncidentAmplitude = 2;
const omega = 1;
const k = 1;

//REFLECTION & TRANSM shifted waves??, Add maths (amplit changes)


//TICKING CLOCK INIT AT GLOBAL LEVEL?!
let t = 0;
let isPlay = false;

const IncidTransLayout = {
    title: "Incident Wave",
    showlegend: false,
    xaxis: {
        showline: false,
        constrain: "domain",
        range: [xMin, xMaxIncident],
        showticklabels: false
        
    },
    yaxis: {
        range: [xMin, xMaxIncident],
        showline: false
    },
    margin: {
        l: 1, r: 1, b:30, t: 30, pad: 10
    }
}

function ReflectedWaveLayout(DielectricWidth){
    
    // const GraphLayout = {
    //     autosize: true,
    //     // margin: {
    //     //     l: 30, r: 40, t: 30, b: 30
    //     // },
    //     hovermode: "closest",
    //     xaxis: {range: [xMin, DielectricWidth], zeroline: true, title: "d"},
    //     yaxis: {
    //         zeroline: false, showticklabels: true, tickmode: 'array',
    //         //tickvals: [30, 60, 90, 120, 150, 180, 210, 240, 270,300],
    //         //ticktext: ['n=0','n=1', 'n=2', 'n=3', 'n=4', 'n=5', 'n=6', 'n=7', 'n=8', 'n=9', 'n=10'],
    //         //side: 'right'
    //     }
    // }

    // return GraphLayout

    //DEBUGGING
    return IncidTransLayout;
}

class Wave {

    constructor(type, dielectricWidth, amplitude, direction, offset){
        this.type = type;
        this.dielectricWidth = dielectricWidth;
        this.amplitude = amplitude;
        this.direction = direction;
        this.offset = offset;
        this.Layout = this.FindLayout();
        this.Data = this.GenerateData();
    }

    FindLayout(){
        let layout = IncidTransLayout
        if (this.type == "reflected"){
            layout = ReflectedWaveLayout(this.dielectricWidth);
        }
        return layout;
    }

    GenerateData(){
        let xMax;
        switch (this.type){
            case "incident":
                xMax = xMaxIncident;
            case "reflected":
                xMax = this.dielectricWidth;
            case "transmitted":
                xMax = this.dielectricWidth;
        }

        let x = numeric.linspace(xMin, xMax, 500);
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
    }

    CreateWavesArray(){
        //type, dielectricWidth, amplitude, direction, offset
        //direction right = 1, left = -1
        let IncidentWave = new Wave("incident", this.DielectricWidth, IncidentAmplitude, 1, 15)

        //need IncidentWave in a nested array - doing this instead of having a separate property for incident (with wave at diff depth in array) saves having to write  code again and again with only slight differences
        return [[IncidentWave], this.CreateReflectedWaves()];
    }

    CreateReflectedWaves(){
        let ReflectedWaves = [];
        for (let i=0; i<this.NumberOfReflections; i++){
            let direction = (-1)**i;
            let amplitude = (-1)**i * IncidentAmplitude * (this.ReflectionCoeff)/100**(i+1);
            let offset = 15 - 3*(i+1);
            let ReflectedWave = new Wave("reflected", this.DielectricWidth, amplitude, direction, offset);
            ReflectedWaves.push(ReflectedWave);
        }
        return ReflectedWaves
    }
}

function CreateDataLine(xData, yData, type) {
    let line = {
                x: xData,
                y: yData,
                type: "scatter",
                mode: "lines",
                line: {
                    color: "rgb(100,100,100)",
                    width: 3
                },
                showscale: true
                };
    
    return line;
}


function initialPlot(waves){
    console.log("called initialPlot");
    console.log(waves)
    //nested loop
    waves.WavesArray.forEach(SetOfWaves => {
        console.log("SetOfWaves", SetOfWaves);
        SetOfWaves.forEach(wave => {
            console.log(wave);
            let DataLine = CreateDataLine(wave.Data[0], wave.Data[1], wave.type);
            Plotly.newPlot(wave.type, [DataLine], wave.Layout);
            // Plotly.newPlot(wave.type);
            // Plotly.react(wave.type, [DataLine], wave.Layout)
        });
    });
}

function update(waves) {
    console.log("called update");
    waves.WavesArray.forEach(SetOfWaves => {
        SetOfWaves.forEach(wave => {
            console.log(wave);
            let DataLine = CreateDataLine(wave.Data[0], wave.Data[1], wave.type);
            Plotly.newPlot(wave.type, [DataLine], wave.Layout);
            // Plotly.newPlot(wave.type);
            // Plotly.react(wave.type, [DataLine], wave.Layout)
        });
    });
}

function NextAnimationFrame(DielectricWidth, ReflectionCoeff, NumberOfReflections){
    //console.log("next frame, t = ", t);
    t += 0.1;
    let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections)

    waves.WavesArray.forEach(SetOfWaves => {
        SetOfWaves.forEach(wave => {
            //console.log(wave)
            let DataLine = CreateDataLine(wave.Data[0], wave.Data[1], wave.type)

            //TODO - BUG - Unhandled Promise Rejection: undefined

            Plotly.animate(wave.type,
                {data: [DataLine]},
                {
                    fromcurrent: true,
                    transition: {duration: 0},
                    frame: {duration: 0, redraw: false},
                    mode: "immediate"
                });
        });
    });
    
    //AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections)
}

function AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections){
    //TODO - BUG - TESTING FOR loop
    //create new instance of waves with updated data - inefficient???
    while (isPlay === true) {
        console.log("playing");
        window.requestAnimationFrame(function() {NextAnimationFrame(DielectricWidth, ReflectionCoeff, NumberOfReflections);})
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
    //update(waves);
    //AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);

    //check if correct!!! - wrapped NextAnimationFrame in anonym func for callback
    //window.requestAnimationFrame( function() {NextAnimationFrame(waves);});
    
   //live update of slider display values and graphs
    $("#PlayButton").on("click", function() {
        $("#PlayButton").value = (isPlay) ? "Play" : "Stop";
        //toggle
        isPlay = ! isPlay;
        AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);
    })


   $("input[type=range]").each(function () {
    $(this).on('input', function () {
        $("#" + $(this).attr("id") + "Display").text($(this).val());
        let ReflectionCoeff = $("#ReflectionCoeff").val();
        let DielectricWidth = $("#DielectricWidth").val();
        let NumberOfReflections = $("#NumberOfReflections").val();

        //t = 0
        //let waves = new Waves(DielectricWidth, ReflectionCoeff, NumberOfReflections);
        //update
        update(waves);
        AnimateAllGraphs(DielectricWidth, ReflectionCoeff, NumberOfReflections);

        });
    });
}


$(window).on("load", main)