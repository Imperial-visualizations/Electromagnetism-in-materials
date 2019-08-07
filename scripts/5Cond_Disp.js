$(window).on('load', function() {
        const dom = {//assigning switches and sliders
            pswitch: $("#polarisation-switch input"),
            wSlider:$("input#angular_frequency"),
            condSlider:$("input#conductorQuality"),
        }
    let plt = {//layout of graph
        layout : {
            showlegend:false,
            showscale: false,
            margin: {
                l: 10, r: 10, b: 10, t: 1, pad: 5
            },
            dragmode: 'orbit',
            scene: {
                aspectmode: "cube",
                xaxis: {range: [-1, 1]},
                yaxis: {range: [-1, 1]},
                zaxis: {range: [-1, 1]},

                camera: {
                    up: {x:1, y: 0, z: 0},//sets which way is up
                    eye: {x: 0.1, y: 2, z: 0}//adjust camera starting view
                }
            },
        },
        layout_disp:{//layout of dispersion relation
                autosize: true,
                xaxis: {
                    showticklabels: false,
                    title: "Wavenumber k",
                },
                yaxis: {
                    showticklabels: true,
                    title: "Relative Angular Frequency",
                },
                margin: {
                   l: 50, r: 10, b: 50, t: 50, pad: 5
               },
               legend: {
                   traceorder: 'normal',
                   x: 0.05, y: 1.05,
                   font: {
                      family: 'sans-serif',
                      size: 14,
                      color: '#000'
                    },
                    //bgcolor: '#E2E2E2',
                    //bordercolor: '#ff0000',
                    //borderwidth: 2
                   orientation: "h"
               },
               font: {
                   family: "Fira Sans",
                   size: 16
               }
        },
        layout_disp2:{//layout of 2nd plot
                autosize: true,
                xaxis: {
                    title: "Relative Angular Frequency",
                    exponentformat: 'e',
                },
                yaxis: {
                    title:"Phase Shift (Radians)"
                },
                margin: {
                   l: 50, r: 10, b: 50, t: 50, pad: 5
               },
               legend: {
                   x: 0, y: 10,
                   orientation: "h"
               },
               font: {
                   family: "Fira Sans",
                   size: 16
               }
        }
    };
let isPlay = false;
let t = 0;
let nPlot = true;
let extraRes = false;

let w_conversion = 7e5; // Factor to make plot wavelength reasonable
let w_0 = 2e10;//gives properties of material

let w_ = [2e10];
let w_1 = 1.5e10;//second resonance
let w_2 = 3e10;
let gamma = 0.1*w_0;
let wd = 0.1*w_0;
let w_d_squared = wd**2;

let polarisation_value = $("input[name = polarisation-switch]:checked").val();//set variables based on value of polarisation
let angular_frequency_ratio   = parseFloat($("input#angular_frequency").val())* w_0;//set variable based on angular frequency input
let conductorQuality = parseFloat($("input#conductorQuality").val());
let w_r = parseFloat($("input#angular_frequency").val());

let n1 = 1;//material before input dielectric
let amplitude = 0.8;//amplitude of em wave
let c = 3e8; // Speed of light

function zero_array(size){//create array of zeros
    let zero =[];
    for (let i = 0;i<size;i++){
        zero.push(0);
    }
    return zero
}

let size = 10000;//give number of points
let zero = zero_array(size);


class Wave{//wave object used to produce em wave
    constructor(E_0, polarisation, w) {
            this.E_0 = E_0;
            this.true_w = w;
            this.w = this.true_w / w_conversion;
            this.k = (this.true_w) / c;
            this.B_0 = E_0;//for convenience of visualisation B and E field are same amplitude
            this.polarisation = "polarisation";
            this.sinusoids = this.create_sinusoids_incident();
        }
    element_cos(matrix,size){//takes cos of element in matrix
        for (let i = 0; i < size ;i++){
            matrix[i] = math.cos(matrix[i]);
        }
    return matrix
    }

    element_exponential(matrix,size){//take exponential of element in matrix
        for (let i = 0;i < size;i++){
            matrix[i] = math.exp(matrix[i]);
        }
    return matrix
    }

    create_sinusoids_incident()//create incident waves
    {
        let z_range = numeric.linspace(-1, 0, size);

        let k_z_cos = this.element_cos(math.add(-w_r*t,math.multiply(this.k,z_range)),size);
        let E_cos,B_cos;

        if (this.polarisation === "s-polarisation") {
            E_cos = [zero, math.multiply(this.E_0, k_z_cos), z_range];//polarisation determines axis of oscillation
            B_cos = [math.multiply(this.B_0,k_z_cos), zero, z_range];
            }
        else{
            E_cos = [math.multiply(this.E_0, k_z_cos), zero, z_range];
            B_cos = [zero, math.multiply(this.B_0, k_z_cos), z_range];
            }

        let E_trace = [];

        E_trace.push(//Electric field trace
            {
            type: "scatter3d",
            mode: "lines",
            name: "e field incident",
            x: E_cos[0],
            y: E_cos[1],
            z: E_cos[2],
            opacity: 1,
            line: {
                width: 4,
                color: "#02893B",
                reversescale: false}
            }
        );

        let B_trace = [];
        B_trace.push(//Magnetic field trace
            {
            type: "scatter3d",
            mode: "lines",
            name: "b field incident",
            x: B_cos[0],
            y: B_cos[1],
            z: B_cos[2],
            opacity: 1,
            line: {
                width: 4,
                color: "#A51900",
                reversescale: false}
            }
        );
        return [E_trace, B_trace]
    };


    attenuation(w_input){

        let w = w_input;


        let z_range = numeric.linspace(0, 1, size);
        conductorQuality = parseFloat($("input#conductorQuality").val());

        //calculate complex and real parts of wavenumber
        let k_im_unscaled = 10000*w*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/100000*w),2),(1/2))-1),(1/2));
        let k_im = 0.00000000000000000004*k_im_unscaled;

        let n_im = (c*k_im)/w;

        let k_real_unscaled = w*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/w),2),(1/2))+1),(1/2)); // scaled for display
        let k_real = 0.000000002*k_real_unscaled;
        let n_real = (c*k_real)/w;


        //calculate phase shift
        let x = w/w_0;
        let kReal = 1000000*x*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*x),2),(1/2))+1),(1/2));
        let kIm = 1000000*x*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*x),2),(1/2))-1),(1/2));
        let phi = Math.atan2(kIm, kReal)*2;
        console.log(phi);


        let exp_E = this.element_exponential(math.multiply(-k_im,z_range),size);//exponential decay of amplitude

        let k_z_cos = this.element_cos(math.add(-w_r*t,math.multiply(k_real,z_range)),size);

        let decayed_cos = math.dotMultiply(exp_E,k_z_cos);

        //calculate phase shifted B field
        let k_z_cosB = this.element_cos(math.add(-w_r*t,math.multiply(k_real,z_range),phi),size);
        let decayed_cosB = math.dotMultiply(exp_E,k_z_cosB);


        let E_end_amp = this.E_0*exp_E.slice(-1);//find final value of amplitude
        let B_end_amp = this.B_0*exp_E.slice(-1);

        let shift = k_real*1;//phase shift of wave for transmitted wave


        let E_cos_atten,B_cos_atten;

        E_cos_atten = [math.multiply(this.E_0, decayed_cos), zero, z_range];
        B_cos_atten = [zero, math.multiply(this.B_0, decayed_cosB), z_range];


        let E_trace_atten = [];

        E_trace_atten.push(
            {
            type: "scatter3d",
            mode: "lines",
            name: "e field attenuated",
            x: E_cos_atten[0],
            y: E_cos_atten[1],
            z: E_cos_atten[2],
            opacity: 1,
            line: {
                width: 4,
                color: "#02893B",
                reversescale: false}
            }
        );

        let B_trace_atten = [];

        B_trace_atten.push(
            {
            type: "scatter3d",
            mode: "lines",
            name: "b field attenuated",
            x: B_cos_atten[0],
            y: B_cos_atten[1],
            z: B_cos_atten[2],
            opacity: 1,
            line: {
                width: 4,
                color: "#A51900",
                reversescale: false}
            }
        );
    return [E_trace_atten,B_trace_atten,E_end_amp,B_end_amp,shift,n_im]
    };

};

    function computeData() {

        $("#angular_frequency-display").html($("input#angular_frequency").val().toString());//update value of display

        angular_frequency_ratio = parseFloat($("input#angular_frequency").val())*(w_0);//update variable values
        conductorQuality = parseFloat($("input#conductorQuality").val());
        //console.log(conductorQuality);
        w_r = parseFloat($("input#angular_frequency").val());
        polarisation_value = $("input[name = polarisation-switch]:checked").val();

        let Incident = new Wave(amplitude,polarisation_value,angular_frequency_ratio,n1);//create wave

        let dielectric_bit = Incident.attenuation(angular_frequency_ratio);//create attenuated wave

        let n_im_max = (w_d_squared*w_0*gamma)/(Math.pow((Math.pow(w_0,2) - Math.pow(w_0,2)),2)+Math.pow(w_0,2)*Math.pow(gamma,2));


        let material_1 = [];
        material_1.push(
            {//dielectric
                opacity: conductorQuality,
                color: '#d9e1ea',
                type: "mesh3d",
                name: "material_1",
                x: [-1, -1, 1, 1, -1, -1, 1, 1],
                y: [-1, 1, 1, -1, -1, 1, 1, -1],
                z: [ 1, 1, 1, 1, 0, 0, 0, 0],
                i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
                j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
                k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
            }
            );
        let data = Incident.sinusoids[0].concat(Incident.sinusoids[1], dielectric_bit[0],dielectric_bit[1],material_1);
        //add all traces to one variable
    return data
    };

    function compute_data_disp() {
        let x = numeric.linspace(0, 2, size);
        let yr = [];
        let yi = [];
        let yvac = [];
        let w;
        let kReal = 0;
        let kIm = 0;
        let kVac = 0;

        for(let i = 0; i< size; i++){
            w = x[i];
            kReal = 1000000*w*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*w),2),(1/2))+1),(1/2)); //scaled up because otherwise numbers are too small and get rounded to zero
            yr.push(kReal);
        }

        for( let i = 0; i < size; i++){
            w = (x[i]);
            kIm = 1000000*w*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*w),2),(1/2))-1),(1/2));
            yi.push(kIm);
        }

        for( let i = 0; i < size; i++){
            w = (x[i]);
            kVac = 1000000*w*Math.pow((Math.pow(1 + Math.pow((0*10000000/1000000*w),2),(1/2))+1),(1/2));
            yvac.push(kVac);
        }

        angular_frequency_ratio = angular_frequency_ratio/w_0;
        kIm = 1000000*angular_frequency_ratio*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*angular_frequency_ratio),2),(1/2))-1),(1/2));
        kReal = 1000000*angular_frequency_ratio*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*angular_frequency_ratio),2),(1/2))+1),(1/2));

        let img_n = kIm;
        let real_n = kReal;


        let r_vac = {
              x: yvac,
              y: x,
              type: 'scatter',
              name: 'Vacuum Dispersion',
              showlegend:true,
        }


        let r_in = {
              x: yi,
              y: x,
              type: 'scatter',
              name: 'Imaginary k',
              showlegend:true,
        };

        let r_rn = {
              x: yr,
              y: x,
              type: 'scatter',
              name: 'Real k',
              showlegend:true,
        };

        let marker_im = {

                x: [img_n],
                y: [parseFloat($("input#angular_frequency").val())],
                showlegend: false,
                type: "scatter",
                mode:"markers",
                name: 'Imaginary n',
                marker: {color: "#002147", size: 12}
        };

        let marker_r = {
                x: [real_n],
                y: [parseFloat($("input#angular_frequency").val())],
                showlegend: false,
                type: "scatter",
                mode:"markers",
                name: 'Real n - 1',
                marker: {color: "#002147", size: 12}
        };

        return [r_rn, r_in, r_vac, marker_r ,marker_im]
    }

    function compute_data_phi (){ //same but with 2 resonances
    let omega = numeric.linspace(0, 2, size);
        let k = [];
        let w;
        let x = numeric.linspace(0, 2, size);
        let phi = []; //Phi values
        for( let i = 0; i < size; i++){
            w = (x[i]);
            kReal = 1000000*w*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*w),2),(1/2))+1),(1/2));
            kIm = 1000000*w*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*w),2),(1/2))-1),(1/2));
            let phiVal = Math.atan2(kIm, kReal)*2;
            phi.push(phiVal);
        }

        kReal = 1000000*angular_frequency_ratio*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*angular_frequency_ratio),2),(1/2))+1),(1/2));
        kIm = 1000000*angular_frequency_ratio*Math.pow((Math.pow(1 + Math.pow((conductorQuality*10000000/1000000*angular_frequency_ratio),2),(1/2))-1),(1/2));
        let phiVal = Math.atan2(kIm, kReal)*2;
        let markerPhi = phiVal;


        let trace1 = {
              x: x,
              y: phi,
              type: 'scatter',
              name: 'Dispersion',
              showlegend: false,
        };

        let marker = {
            x: [parseFloat($("input#angular_frequency").val())],
            y: [markerPhi],
            showlegend: false,
            type: "scatter",
            mode:"markers",
            marker: {color: "#002147", size: 12}
        }

        return [trace1, marker]

    }

    function update_graph_n(){//update dispersion

        Plotly.animate("graph_disp",
            {data: compute_data_disp()},//updated data
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            }
        );

        Plotly.animate("graph_phi",
            {data: compute_data_phi()},//updated data
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            }
        );

    }

    function update_graph(){//update animation
        Plotly.animate("graph",
            {data: computeData()},//updated data
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            }
        );
    };

    function play_loop(){
        if(isPlay === true) {
            t++;
            Plotly.animate("graph",
                {data: computeData()},
                {
                    fromcurrent: true,
                    transition: {duration: 0,},
                    frame: {duration: 0, redraw: false,},
                    mode: "immediate"
                });

        requestAnimationFrame(play_loop);
        }
        return 0;
    };


    function initial(){
        Plotly.purge("graph");
        Plotly.newPlot('graph', computeData(),plt.layout);//create animation plot

        Plotly.purge("graph_disp");
        Plotly.newPlot('graph_disp', compute_data_disp(),plt.layout_disp);//create real refractive index graph

        Plotly.purge("graph_phi");
        Plotly.newPlot('graph_phi', compute_data_phi(), plt.layout_disp2);

        dom.pswitch.on("change", update_graph);//update graph animation
        dom.wSlider.on("input",update_graph);
        dom.wSlider.on("input",update_graph_n);//update refractive index graph
        dom.condSlider.on("input",update_graph);
        dom.condSlider.on("input",update_graph_n);


        $('#graphChangeButton').on('click', function() {
            nPlot = !nPlot;

            if(nPlot){
                $('#graph_disp').show();
                $('#graph_phi').hide();
                $('#graphChangeButton').html('Phase Shift');
            } else {
                $('#graph_disp').hide();
                $('#graph_phi').show();
                $('#graphChangeButton').html('Dispersion Relation');
            }
        });


        $('#playButton').on('click', function() {
            if(isPlay){ $('#playButton').html("Play");}
            else {$('#playButton').html("Stop");}
            //document.getElementById("playButton").value = (isPlay) ? "Play" : "Stop";
            isPlay = !isPlay;
            t = 0;
            requestAnimationFrame(play_loop);
        });

    };
initial();//run the initial loading
});