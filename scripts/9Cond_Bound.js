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
            yLine.push(initialAmplitude*Math.cos(2* omega / 3 *i));
        } else {
            yLine.push(initialAmplitude*Math.exp(-i/skinDepth)*Math.cos(2* omega / 3 *i))
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
    let omega = parseFloat(document.getElementById('Slider_omega_9').value);
    let skinDepth = parseFloat(document.getElementById('Slider_N_9').value);
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
    const xMin = -20;
    const xMax = 20;
    const plotStep = 0.01;
    let skinDepth = 3;
    let initialAmplitude = 10;
    let omega = 2;

    const dom = {
        tswitch: $("#wave-switch input"),
        afSlider: $("input#Slider_omega_9"),
        NSlider: $("input#Slider_N_9"),
    };

    const layoutVector_1b = {
        title: "Gradient Field",
        showlegend: false,
        xaxis: {
            constrain: "domain",
            range: [-20, 20],
            title: "x",
            showticklabels: false
        },
        yaxis: {
//            scaleanchor: "x",
            range: [-15, 15],
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
    dom.afSlider.on("input", initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude) );
    dom.NSlider.on("input", initialPlot(xMin, xMax, plotStep, layoutVector_1b, initialAmplitude) );

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

//    $('#Function_Selector').on("input", function(){
//        //update plots when function is changed
////        plot(xMin, xMax, yMin, yMax, plotStep, xScalarPlot, yScalarPlot, xScalarLine1_1b, yScalarLine1_1b,
////        xScalarLine2_1b, yScalarLine2_1b, xLineMin, yLineMin, xLineMax, yLineMax, dataLineAVector, dataLineBVector, dataPointAVector, dataPointBVector,
////        sigma1b,layoutScalar_1b, layoutVector_1b);
//    });
};

$(document).ready(main); //Load setup when document is ready.