function setupxData (xMin, xMax, plotStep) {
    let xLine = [];
    for (let i = xMin; i <= xMax; i += plotStep){
        xLine.push(i);
    };
    return xLine;
};

function setupyIncidentData (xMin, xMax, plotStep, initialAmplitude, omega, skinDepth){
    let yLine = [];
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(initialAmplitude*Math.cos(2* omega / 3e8 *i));
        } else {
            yLine.push(initialAmplitude*Math.exp(-i/skinDepth)*Math.cos(2* omega / 3e8 *i))
        };
    };
    return yLine;
};

function dataIncidentCompile(xLine, yLine) {
    let dataLine = {
                         x:xLine,
                         y:yLine,
                         type: 'scatter',
                         mode: 'lines',
                         line: {
                                color: 'rgb(0,0,0)',
                                width: 3
                              },
                         name: 'Path 1',
                         showscale: false
                     };
    return dataLine;
};

function initialPlot (xMin, xMax, plotStep, layout, initialAmplitude){
    let omega = parseFloat(document.getElementById('Slider_omega_9').value)* Math.pow(10,15);
    let sigma = parseFloat(document.getElementById('Slider_sigma_9').value) * Math.pow(10,4);
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega))
    let xLine = setupxData(xMin, xMax, plotStep);
    let yLine = setupyIncidentData(xMin, xMax, plotStep, initialAmplitude, omega, skinDepth);
    let dataIncident = dataIncidentCompile (xLine, yLine);
    let condition =  $("input[name = wave-switch]:checked").val();

    if (condition === "incident") {
        Plotly.react("Boundary_Plot_9", [dataIncident], layout);
    } else if (condition === "reflected") {
        Plotly.purge("Boundary_Plot_9");
    } else if (condition === "reflected plus incident") {
        Plotly.purge("Boundary_Plot_9");
    };
};

function main(){
    const xMin = -1e-6;
    const xMax = -1* xMin;
    const plotStep = xMax/10000;
    let skinDepth = 3;
    let initialAmplitude = 0.7 * xMax;
    let omega = 2;
    let isPlay = false;

    const dom = {
        tswitch: $("#wave-switch input"),
        omegaSlider: $("input#Slider_omega_9"),
        sigmaSlider: $("input#Slider_sigma_9"),
    };

    const layoutVector_1b = {
        title: "Gradient Field",
        showlegend: false,
        xaxis: {
            constrain: "domain",
            range: [xMin, xMax],
            title: "x",
            showticklabels: false
        },
        yaxis: {
//            scaleanchor: "x",
            range: [xMin, xMax],
            showticklabels: false,
            title: "y"
        },
        margin: {
            l: 1, r: 1, b: 30, t: 30, pad: 10
        },
    };



    initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude);

//jQuery to update the plot as the value of the slider changes.

    dom.tswitch.on("change", initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude) );
    dom.omegaSlider.on("input", initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude) );
    dom.sigmaSlider.on("input", initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude) );

    $("input[type=range]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
            initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude);
        });

    });

    $("input[type=radio]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
//            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
            initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude);
        });

    });

    $('#playButton').on('click', function() {
        document.getElementById("playButton").value = (isPlay) ? "Play" : "Stop";//change play/stop label
        isPlay = !isPlay;
//        t = 0;//reset time
//        requestAnimationFrame(initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude));
    });

//    $('#Function_Selector').on("input", function(){
//        //update plots when function is changed
////        plot(xMin, xMax, yMin, yMax, plotStep, xScalarPlot, yScalarPlot, xScalarLine1_1b, yScalarLine1_1b,
////        xScalarLine2_1b, yScalarLine2_1b, xLineMin, yLineMin, xLineMax, yLineMax, dataLineAVector, dataLineBVector, dataPointAVector, dataPointBVector,
////        sigma1b,layoutScalar_1b, layoutVector_1b);
//    });
};

$(document).ready(main); //Load setup when document is ready.