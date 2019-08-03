function setupxData (xMin, xMax, plotStep) {
    let xLine = [];
    for (let i = xMin; i <= xMax; i += plotStep){
        xLine.push(i);
    };
    return xLine;
};

function setupyIncidentData (xMin, xMax, t, plotStep, initialAmplitude, omega, sigma){
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(0.1 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
//            yLine.push(initialAmplitude*Math.cos(2* omega / 3e8 *i + omega*t));
//            yLine.push(initialAmplitude*Math.cos(omega*t)* 2e6 * i);
//              yLine.push( initialAmplitude * (Math.cos(omega / 3e8 *i)*Math.cos(omega *t) - Math.sin(omega / 3e8 *i)*Math.sin(omega *t)))
              yLine.push( initialAmplitude * (Math.cos(omega / 3 *i)*Math.cos(-omega *t) - Math.sin(omega / 3 *i)*Math.sin(-omega *t)))
        } else {
//            yLine.push(initialAmplitude*Math.exp(-i/skinDepth)*Math.cos(2* omega / 3e8 *i + omega*t))
//            yLine.push(initialAmplitude*Math.cos(omega*t)* Math.exp(2e6 * i) + initialAmplitude*Math.cos(omega*t)* 2e6 * i);
              yLine.push( initialAmplitude*Math.exp(-i/skinDepth) *  (Math.cos(omega / 3 *i)*Math.cos(-omega *t) - Math.sin(omega / 3 *i)*Math.sin(-omega *t)));
        };
    };
    return yLine;
};

function setupyReflectionData (xMin, xMax, plotStep, initialAmplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(Math.sqrt( 1 - Math.sqrt(8*8.85e-12*omega/sigma) )*initialAmplitude*Math.cos(2* omega / 3e8 *i - Math.PI));
        } else {
            yLine.push(initialAmplitude*Math.exp(-i/skinDepth)*Math.cos(2* omega / 3e8 *i))
        };
    };
    return yLine;

}

function setupyCombinedData (xMin, xMax, plotStep, initialAmplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(initialAmplitude*Math.cos(2* omega / 3e8 *i) +
            Math.sqrt( 1 - Math.sqrt(8*8.85e-12*omega/sigma) )*initialAmplitude*Math.cos(2* omega / 3e8 *i - Math.PI));
        } else {
            yLine.push(initialAmplitude*Math.exp(-i/skinDepth)*Math.cos(2* omega / 3e8 *i));
        };
    };
    return yLine;

}

function setupyIncidentEnvelopeData (xMin, xMax, plotStep, initialAmplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(initialAmplitude);
        } else {
            yLine.push(initialAmplitude*Math.exp(-i/skinDepth));
        };
    };
    return yLine;
}

function setupyReflectionEnvelopeData (xMin, xMax, plotStep, initialAmplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(Math.sqrt( 1 - Math.sqrt(8*8.85e-12*omega/sigma) )*initialAmplitude);
        } else {
            yLine.push(initialAmplitude*Math.exp(-i/skinDepth));
        };
    };
    return yLine;

}

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

function dataIncidentEnvelopeCompile(xLine, yLine) {
    let dataLine = {
                         x:xLine,
                         y:yLine,
                         type: 'scatter',
                         mode: 'lines',
                         line: {
                                dash: 'dashdot',
                                color: 'rgb(34,139,34)',
                                width: 3
                              },
                         name: 'Path 1',
                         showscale: false
                     };
    return dataLine;
};

function dataReflectionCompile(xLine, yLine) {
    let dataLine = {
                         x:xLine,
                         y:yLine,
                         type: 'scatter',
                         mode: 'lines',
                         line: {
                                color: 'rgb(220,20,60)',
                                width: 3
                              },
                         name: 'Path 1',
                         showscale: false
                     };
    return dataLine;
};

function dataReflectionEnvelopeCompile(xLine, yLine) {
    let dataLine = {
                         x:xLine,
                         y:yLine,
                         type: 'scatter',
                         mode: 'lines',
                         line: {
                                dash: 'dashdot',
                                color: 'rgb(186,85,211)',
                                width: 3
                              },
                         name: 'Path 1',
                         showscale: false
                     };
    return dataLine;
};

function dataCombinedCompile(xLine, yLine) {
    let dataLine = {
                         x:xLine,
                         y:yLine,
                         type: 'scatter',
                         mode: 'lines',
                         line: {
                                color: '(0,0,128)',
                                width: 3
                              },
                         name: 'Path 1',
                         showscale: false
                     };
    return dataLine;
};

function dataPlot (xMin, xMax, t, plotStep, initialAmplitude) {
//    let omega = parseFloat(document.getElementById('Slider_omega_9').value)* Math.pow(10,15);
//    let sigma = parseFloat(document.getElementById('Slider_sigma_9').value) * Math.pow(10,5);
//    let omega = parseFloat(document.getElementById('Slider_omega_9').value)/1000;
    let omega = parseFloat(document.getElementById('Slider_omega_9').value);
    let sigma = parseFloat(document.getElementById('Slider_sigma_9').value);
    let xLine = setupxData(xMin, xMax, plotStep);

    let condition =  $("input[name = wave-switch]:checked").val();

    let yIncidentEnvelope = setupyIncidentEnvelopeData(xMin, xMax, plotStep, initialAmplitude, omega, sigma);
    let dataIncidentEnvelope = dataIncidentEnvelopeCompile(xLine, yIncidentEnvelope);

    let yReflectionEnvelope = setupyReflectionEnvelopeData(xMin, xMax, plotStep, initialAmplitude, omega, sigma);
    let dataReflectionEnvelope = dataReflectionEnvelopeCompile(xLine, yReflectionEnvelope);

    if (condition === "incident") {
        let yLine = setupyIncidentData(xMin, xMax, t, plotStep, initialAmplitude, omega, sigma);
        let dataIncident = dataIncidentCompile (xLine, yLine);
        return [dataIncident, dataIncidentEnvelope];
    } else if (condition === "reflected") {
        let yLine = setupyReflectionData (xMin, xMax, plotStep, initialAmplitude, omega, sigma);
        let dataReflection = dataReflectionCompile (xLine, yLine);
        return [dataReflection, dataReflectionEnvelope];
    } else if (condition === "reflected plus incident") {
        let yLine = setupyCombinedData (xMin, xMax, plotStep, initialAmplitude, omega, sigma);
        let dataCombined = dataCombinedCompile (xLine, yLine);
        return [dataCombined, dataIncidentEnvelope, dataReflectionEnvelope];
    };
};

function plot(data, layout) {
    Plotly.react("Boundary_Plot_9", data, layout);
}

function compileAndPlot(xMin, xMax, t, plotStep, initialAmplitude, layout){
    let data = dataPlot(xMin, xMax, t, plotStep, initialAmplitude);
    plot(data, layout);
}



function main(){
    const xMin = -20;
//    const xMin = -2e-6;
    const xMax = -1* xMin;
    const plotStep = xMax/100;
    let skinDepth = 3;
    let initialAmplitude = 0.7 * xMax;
//    let omega = parseFloat(document.getElementById('Slider_omega_9').value)* Math.pow(10,15);
//    let sigma = parseFloat(document.getElementById('Slider_sigma_9').value) * Math.pow(10,5);
    let isPlay = false;
    let t = 0;

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

    function playLoop(){//adds time evolution
//        let dt = 2 * Math.PI / omega / 500
//        let dt = 1e-17;
        if(isPlay === true) {
            t += 0.01;
            Plotly.animate("Boundary_Plot_9",
                {data: dataPlot(xMin, xMax, t, plotStep, initialAmplitude)},
                {
                    fromcurrent: true,
                    transition: {duration: 0},
                    frame: {duration: 0, redraw: false,},
                    //mode: "afterall"
                    mode: "immediate"
                });
            console.log(t);
//            data = dataPlot (xMin, xMax, t, plotStep, initialAmplitude);
//            plot(data, layoutVector_1b);

            window.requestAnimationFrame(playLoop);//loads next frame
        } else {
        console.log("yeet");}
    };



    compileAndPlot(xMin, xMax, t, plotStep, initialAmplitude, layoutVector_1b);

//jQuery to update the plot as the value of the slider changes.

    dom.tswitch.on("change", playLoop() );
    dom.omegaSlider.on("input", playLoop() );
    dom.sigmaSlider.on("input", playLoop() );

//    $("input[type=range]").each(function () {
//        /*Allows for live update for display values*/
//        $(this).on('input', function(){
//            //Displays: (FLT Value) + (Corresponding Unit(if defined))
//            $("#"+$(this).attr("id") + "Display").val( $(this).val());
//            //NB: Display values are restricted by their definition in the HTML to always display nice number.
////            compileAndPlot(xMin, xMax, t, plotStep, initialAmplitude, layoutVector_1b);
//            requestAnimationFrame(playLoop);
//        });
//
//    });

    $("input[type=radio]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
//            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
//            compileAndPlot(xMin, xMax, t, plotStep, initialAmplitude, layoutVector_1b);
            requestAnimationFrame(playLoop);
        });

    });

    $('#playButton').on('click', function() {
        document.getElementById("playButton").value = (isPlay) ? "Play" : "Stop";//change play/stop label
        isPlay = !isPlay;
        t = 0;//reset time
        requestAnimationFrame(playLoop);
    });

};

$(document).ready(main); //Load setup when document is ready.