$(window).on('load', function() {
    const dom = {//assigning switches and sliders
        wSlider:$("input#Tau"),
    }

var xPlus = [];
var yPlus = [];
var zPlus = [];
var xMinus = [];
var yMinus = [];
var zMinus = [];

var layout = {
xaxis: {
    title: "Time"
},
yaxis: {
    title: "Relative Amplitude"
}
};

let omega = 1;
let sigma = 1;
let tau = 0.9;

function getData(tau){
console.log(tau);
let t = numeric.linspace(0,20,200);
let E = [];
let J = [];

for(let i = 0; i < t.length; i++){
    E.push(Math.cos(omega*t[i]));

    let Jmag = (Math.pow((sigma*sigma)/(1+Math.pow(omega*tau,2)),(1/2)));
    J.push(Jmag*Math.cos(omega*t[i] + Math.atan(omega*tau)));
}

let trace1 = {
      x: t,
      y: E,
      type: 'scatter',
      name: 'E',
};

let trace2 = {
      x: t,
      y: J,
      type: 'scatter',
      name: 'J',
};

let data = [trace1 , trace2];
return data;
}

function updateGraph() {
let tau = parseFloat($("input#Tau").val());
//Update slider display value
$("#tau-display").html($("input#Tau").val().toString());

Plotly.animate("plot",
        {data: getData(tau)},//updated data
        {
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
            mode: "immediate"
        }
    );
}



Plotly.newPlot('plot', getData(tau), layout);
dom.wSlider.on("input",updateGraph);
});