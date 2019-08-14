$(window).on('load', function() {
    const dom = {//assigning switches and sliders]
        wSlider:$("input#angular_frequency"),
        gammaSlider:$("input#gamma"),
    }

const layout = {//layout of refractive index plot
                autosize: true,
                xaxis: {
                    showticklabels: false,
                },
                yaxis: {
                    showticklabels: false,
                },
                margin: {
                   l: 50, r: 10, b: 50, t: 50, pad: 5
               },
               font: {
                   family: "Fira Sans",
                   size: 16
               }
          }

const layoutPhase = {//layout of refractive index plot
                autosize: true,
                xaxis: {
                    title: "Angular Frequency Ratio"
                },
                yaxis: {
                    title: "Phase Shift /Radians"
                },
                margin: {
                   l: 50, r: 10, b: 50, t: 50, pad: 5
               },
               font: {
                   family: "Fira Sans",
                   size: 16
               }
          }

let omega = 1;
let k = 4;
let t = 1;
let attenuation = 0.5;
let gamma = 0.05;
let springAmp = 0.5;
let playing = false;
let w_0 = 1; //creates 2 resonances either side of omega_0 for some reason

function computeData() { //computer data for plot

$("#angular_frequency-display").html($("input#angular_frequency").val().toString());//update value of display
omega = parseFloat($("input#angular_frequency").val());
gamma = parseFloat($("input#gamma").val());

let x = numeric.linspace(0,10, 1000);
let yUnAt = [];
let yAt = [];
let x1 = [];
let x2 = [];

for(let i = 0; i < x.length; i++){

    //draw unattenuated part of wave
    if (x[i]<5){
        x1.push(x[i]);
        yVal = Math.cos(k*x[i] - omega*t);
        yUnAt.push(yVal);
    }

let alpha = 1- Math.pow(omega,2);
let Q = w_0/gamma;
let beta = omega/Q;
let springAmp = Math.pow((Math.pow(alpha,2) + Math.pow(beta,2)),(-1/2));

let phaseShift = Math.atan2((-omega*gamma),(Math.pow(w_0,2)-Math.pow(omega,2)));

if(Math.abs(1/springAmp) > 1){springAmp =1;}

    //draw attenuated part of wave
    if (x[i]>5){
        x2.push(x[i]);
        yVal = (1/springAmp)*Math.cos(k*x[i] - omega*t + phaseShift);
        yAt.push(yVal);
    }

}

//specify spring
let xSpring = [5,5];
let ySpring = [];

ySpring.push(0);

let alpha = 1- Math.pow(omega,2);
let Q = w_0/gamma;
let beta = omega/Q;
let springAmp = 0.3*(Math.pow((Math.pow(alpha,2) + Math.pow(beta,2)),(-1/2)));

springX = springAmp*Math.cos(omega*t);
ySpring.push(springX);


let spring = {
  x: xSpring,
  y: ySpring,
  type: 'scatter',
  name: 'Spring',
  showlegend: true,
}

let electron = {
  x: xSpring,
  y: ySpring,
  type: 'scatter',
  name: 'Electron',
  showlegend: true,
  mode:"markers",
  marker: {color: "#ff0000", size: 12}
}

let nucleus = {
  x: xSpring,
  y: [0,0],
  type: 'scatter',
  name: 'Equilibrium Position',
  showlegend: true,
  mode:"markers",
  marker: {color: "#00ff11", size: 20}
}

let unattenuated = {
  x: x1,
  y: yUnAt,
  type: 'scatter',
  name: 'Unattenuated EM Wave',
  showlegend: true,
};

let attenuated = {
  x: x2,
  y: yAt,
  type: 'scatter',
  name: 'Attenuated EM Wave',
  showlegend: true,
};


return [unattenuated, attenuated, spring, electron, nucleus]
}

function computePhase() {
$("#angular_frequency-display").html($("input#angular_frequency").val().toString());//update value of display
omega = parseFloat($("input#angular_frequency").val());
gamma = parseFloat($("input#gamma").val());

let w = numeric.linspace(0, 2, 200);
let phi = [];

for(let i = 0; i < w.length; i++){
    phi.push(Math.atan2((-w[i]*gamma),(Math.pow(w_0,2)-Math.pow(w[i],2))));
}

let phaseShift = Math.atan2((-omega*gamma),(Math.pow(w_0,2)-Math.pow(omega,2)));


let trace1 = {
  x: w,
  y: phi,
  type: 'scatter',
  name: 'Phase shift',
  showlegend: false,
};

let marker = {
  x: [omega],
  y: [phaseShift],
  type: 'scatter',
  name: 'Electron',
  showlegend: false,
  mode:"markers",
  marker: {color: "#002147", size: 12}
}

return [trace1, marker]

}

function updateGraph(){//update animation
Plotly.animate("plot",
    {data: computeData()},//updated data
    {
        fromcurrent: true,
        transition: {duration: 0,},
        frame: {duration: 0, redraw: false,},
        mode: "immediate"
    }
);

Plotly.animate("phasePlot",
    {data: computePhase()},//updated data
    {
        fromcurrent: true,
        transition: {duration: 0,},
        frame: {duration: 0, redraw: false,},
        mode: "immediate"
    }
);
};


function playAnimation() {
if(playing){
t = t + Math.PI/20;
if(omega*t > Math.Pi*8){t = 0;}
Plotly.animate("plot",
    {data: computeData()},
    {
        fromcurrent: true,
        transition: {duration: 0,},
        frame: {duration: 0, redraw: false,},
        mode: "immediate"
    });

requestAnimationFrame(playAnimation);

}
}

$('#playButton').on('click', function() {
playing = !playing;
playAnimation();

})

//Initial Plot
Plotly.purge("plot");
Plotly.newPlot('plot', computeData(), layout);

Plotly.purge("phasePlot");
Plotly.newPlot('phasePlot', computePhase(), layoutPhase);

dom.wSlider.on("input",updateGraph);
dom.gammaSlider.on("input",updateGraph);
})