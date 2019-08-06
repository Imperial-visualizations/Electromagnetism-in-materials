function setupxData (xMin, xMax, plotStep) {
    let xLine = [];
    for (let i = xMin; i <= xMax; i += plotStep){
        xLine.push(i);
    };
    return xLine;
};

function setupyIncidentData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma){
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
              yLine.push( amplitude * (Math.cos(omega / c *i)*Math.cos(-omega *t) - Math.sin(omega / c *i)*Math.sin(-omega *t)))

        } else {
              yLine.push( amplitude*Math.exp(-i/skinDepth) *  (Math.cos(omega / c *i)*Math.cos(-omega *t) - Math.sin(omega / c *i)*Math.sin(-omega *t)));
        };
    };
    return yLine;
};

function setupyReflectionData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(Math.sqrt( 1 - Math.sqrt(8*8.85e-12*omega/sigma) )*amplitude* ( Math.cos( omega*t )*Math.cos( omega / c *i - Math.PI) - Math.sin(omega *t)*Math.sin(omega / c *i - Math.PI)) );
        } else {
//            yLine.push(initialAmplitude*Math.exp(-i/skinDepth)* ( Math.cos( -omega*t )*Math.cos( omega / c *i) - Math.sin(-omega *t)*Math.sin(omega / c *i )) );
              yLine.push(0);
        };
    };
    return yLine;

}

function setupyCombinedData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push( amplitude * (Math.cos(omega / c *i)*Math.cos(-omega *t) - Math.sin(omega / c *i)*Math.sin(-omega *t)) +
            Math.sqrt( 1 - Math.sqrt(8*8.85e-12*omega/sigma) )*amplitude* ( Math.cos( omega*t )*Math.cos( omega / c *i - Math.PI) - Math.sin(omega *t)*Math.sin(omega / c *i - Math.PI)) );
        } else {
            yLine.push(amplitude*Math.exp(-i/skinDepth)* ( Math.cos( -omega*t )*Math.cos( omega / c *i) - Math.sin(-omega *t)*Math.sin(omega / c *i)));
        };
    };

    return yLine;

}

function setupyIncidentEnvelopeData (xMin, xMax, plotStep, amplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(amplitude);
        } else {
            yLine.push(amplitude*Math.exp(-i/skinDepth));
        };
    };
    return yLine;
}

function setupyReflectionEnvelopeData (xMin, xMax, plotStep, amplitude, omega, sigma) {
    let yLine = [];
    let skinDepth = Math.sqrt( (2)/(4e-7 * Math.PI * sigma * omega));
    for (let i = xMin; i <= xMax; i += plotStep) {
        if (i <= 0) {
            yLine.push(Math.sqrt( 1 - Math.sqrt(8*8.85e-12*omega/sigma) )*amplitude);
        } else {
            yLine.push(amplitude*Math.exp(-i/skinDepth));
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
                         name: 'Incident Wave',
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
                         name: 'Incident Amplitude',
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
                         name: 'Reflected Wave',
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
                         name: 'Reflected Amplitude',
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
                                color: 'rgb(0,0,128)',
                                width: 3
                              },
                         name: 'Resultant Wave',
                         showscale: false
                     };
    return dataLine;
};

function dataPlot (xMin, xMax, t, c, plotStep) {
    let omega = parseFloat(document.getElementById('Slider_omega_9').value)* Math.pow(10,15);
    let sigma = parseFloat(document.getElementById('Slider_sigma_9').value)* Math.pow(10,5);
    let xLine = setupxData(xMin, xMax, plotStep);
    let amplitude = parseFloat(document.getElementById('Slider_E_9').value)* Math.pow(10,15);

    let condition =  $("input[name = wave-switch]:checked").val();

    if (omega * 8.85e-12 / sigma > 0.1) {
        document.getElementById("approximationMessage").style.display = "block"
    } else {
        document.getElementById("approximationMessage").style.display = "none"};

    let radiationPressure = 8.85e-12 * amplitude**2

    $("#radiationPressure").text(`Radiation Pressure = ${Math.round(100*radiationPressure)/100}`);

    let yIncidentEnvelope = setupyIncidentEnvelopeData(xMin, xMax, plotStep, amplitude, omega, sigma);
    let dataIncidentEnvelope = dataIncidentEnvelopeCompile(xLine, yIncidentEnvelope);

    let yReflectionEnvelope = setupyReflectionEnvelopeData(xMin, xMax, plotStep, amplitude, omega, sigma);
    let dataReflectionEnvelope = dataReflectionEnvelopeCompile(xLine, yReflectionEnvelope);

    if (condition === "incident") {
        let yLine = setupyIncidentData(xMin, xMax, t, c, plotStep, amplitude, omega, sigma);
        let dataIncident = dataIncidentCompile (xLine, yLine);
        return [dataIncident, dataIncidentEnvelope];
    } else if (condition === "reflected") {
        let yLine = setupyReflectionData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma);
        let dataReflection = dataReflectionCompile (xLine, yLine);
        return [dataReflection, dataReflectionEnvelope];
    } else if (condition === "resultant") {
        let yLine = setupyCombinedData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma);
        let dataCombined = dataCombinedCompile (xLine, yLine);
        return [dataCombined, dataIncidentEnvelope, dataReflectionEnvelope];
    } else if (condition === "all"){
        let yIncidentLine = setupyIncidentData(xMin, xMax, t, c, plotStep, amplitude, omega, sigma);
        let dataIncident = dataIncidentCompile (xLine, yIncidentLine);

        let yReflectedLine = setupyReflectionData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma);
        let dataReflection = dataReflectionCompile (xLine, yReflectedLine);

        let yCombinedLine = setupyCombinedData (xMin, xMax, t, c, plotStep, amplitude, omega, sigma);
        let dataCombined = dataCombinedCompile (xLine, yCombinedLine);

        return [dataIncident, dataReflection, dataCombined];
    };

};

function plot(data, layout) {
    Plotly.react("Boundary_Plot_9", data, layout);
}

function compileAndPlot(xMin, xMax, t, c, plotStep, layout){
    let data = dataPlot(xMin, xMax, t, c, plotStep);
    plot(data, layout);
}



function main(){
    const xMin = -2e-6;
    const xMax = -1* xMin;
    const plotStep = xMax/100;
    const c = 3e8
    let isPlay = false;
    let t = 0;


    const plotLayout = {
        title: "Radiation Pressure Exerted on a Conductor Boundary",
//        showlegend: false,
        xaxis: {
            constrain: "domain",
            range: [xMin, xMax/2.5],
            title: "x",
            showticklabels: false
        },
        yaxis: {
//            scaleanchor: "x",
            range: [xMin*Math.pow(10,21.5), xMax*Math.pow(10,21.5)],
            showticklabels: false,
            title: "y"
        },
        margin: {
            l: 1, r: 1, b: 30, t: 30, pad: 10
        },
    };

    document.getElementById("approximationMessage").style.display = "none"

    function playLoop(){//adds time evolution
    if (isPlay === false) {
//        Plotly.animate("Boundary_Plot_9",
//        {data: dataPlot(xMin, xMax, t, c, plotStep, initialAmplitude)},
//        {
//            fromcurrent: true,
//            transition: {duration: 0},
//            frame: {duration: 0, redraw: false,},
//            //mode: "afterall"
//            mode: "immediate"
//        });
        compileAndPlot(xMin, xMax, t, c, plotStep, plotLayout);
    } else if (isPlay === true) {
        t += 5e-18;
//        Plotly.animate("Boundary_Plot_9",
//            {data: dataPlot(xMin, xMax, t, c, plotStep, initialAmplitude)},
//            {
//                fromcurrent: true,
//                transition: {duration: 0},
//                frame: {duration: 0, redraw: false,},
//                //mode: "afterall"
//                mode: "immediate"
//            });
        compileAndPlot(xMin, xMax, t, c, plotStep, plotLayout);
        requestAnimationFrame(playLoop);//loads next frame
        }

    };



    compileAndPlot(xMin, xMax, t, c, plotStep, plotLayout);

//jQuery to update the plot as the value of the slider changes.


    $("input[type=range]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
            if (isPlay === false){
                playLoop();
            } else {
                return 0;}
        });

    });

    $("input[type=radio]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
//            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
        if (isPlay === false){
                playLoop();
            } else {
                return 0;}
        });

    });

    $('#playButton').on('click', function() {
        document.getElementById("playButton").value = (isPlay) ? "Play" : "Stop";//change play/stop label
        isPlay = !isPlay;
        requestAnimationFrame(playLoop);
    });

};

$(document).ready(main); //Load setup when document is ready.