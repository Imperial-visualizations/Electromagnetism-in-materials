$(window).on('load', function() {
        const dom = {//assigning switches and sliders]
            wSlider:$("input#angular_frequency"),
        }

const layout = {//layout of refractive index plot
                    autosize: true,
                    xaxis: {
                        showticklabels: false,
                    },
                    yaxis: {
                        showticklabels: false,
                        title: "x"
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
let springAmp = 0.5;
let playing = true;
let w_0 = 1.225 ; //creates 2 resonances either side of omega_0 for some reason

function computeData() { //computer data for plot

    $("#angular_frequency-display").html($("input#angular_frequency").val().toString());//update value of display
    omega = parseFloat($("input#angular_frequency").val());

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

    springAmp = (0.5*(Math.pow(w_0,2) - Math.pow(omega,2)))/(Math.pow((Math.pow(w_0,2)-Math.pow(omega,2)),2)-Math.pow(attenuation*omega,2));
    if(Math.abs(1/springAmp) > 1){springAmp =1;}

        //draw attenuated part of wave
        if (x[i]>5){
            x2.push(x[i]);
            yVal = (1/springAmp)*Math.cos(k*x[i] - omega*t);
            yAt.push(yVal);
        }

    }

    //specify spring
    let xSpring = [5,5];
    let ySpring = [];

    E0 = yUnAt[yUnAt.length - 1];
    ySpring.push(0);
    springAmp = (0.1*(Math.pow(w_0,2) - Math.pow(omega,2)))/(Math.pow((Math.pow(w_0,2)-Math.pow(omega,2)),2)-Math.pow(attenuation*omega,2));
    springX = springAmp*Math.cos(omega*t);
    console.log(springX);
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

dom.wSlider.on("input",updateGraph);
})