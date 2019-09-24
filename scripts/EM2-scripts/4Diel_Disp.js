$(window).on('load', function() {
        const dom = {//assigning switches and sliders
            pswitch: $("#polarisation-switch input"),
            wSlider:$("input#angular_frequency"),
        }
    let plt = {//layout of graph
        layout : {
            showlegend: false,
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
        layout_real:{//layout of refractive index plot
                autosize: true,
                xaxis: {
                    range: [0, 2],
                    title: "Angular Frequency Ratio"
                },
                yaxis: {
                    range: [-0.06,0.14],
                },
                margin: {
                   l: 50, r: 10, b: 50, t: 50, pad: 5
               },
               legend: {
                   traceorder: 'normal',
                   x: 0.05, y: 1,
                   font: {
                      family: 'sans-serif',
                      size: 14,
                      color: '#000'
                    },
                    //bgcolor: '#E2E2E2',
                    bordercolor: '#ff0000',
                    borderwidth: 2
                   //orientation: "h"
               },
               font: {
                   family: "Fira Sans",
                   size: 16
               }
        },
        layout_disp:{//layout of dispersion plot
                autosize: true,
                xaxis: {
                    title: "Real Wavenumber, k",
                    exponentformat: 'e',
                },
                yaxis: {
                    title:"Relative Angular Frequency"
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


        //calculate refractive indices
        let niTot = 0;
        let nrTot = 1;
        for(let i=0; i < w_.length; i++){
            niTot = niTot + (w_d_squared*w*gamma)/(Math.pow((Math.pow(w,2) - Math.pow(w_[i],2)),2)+Math.pow(w,2)*Math.pow(gamma,2));
            nrTot = nrTot - (w_d_squared*(Math.pow(w,2)-Math.pow(w_[i],2))/(Math.pow((Math.pow(w,2)-Math.pow(w_[i],2)),2) + Math.pow(w,2)*Math.pow(gamma,2)));
        }

        let n_im = niTot;
        let n_real = nrTot;

        //calculate real refractive index
        //let n_real = 1 - (w_d_squared*(Math.pow(w,2)-Math.pow(w_0,2))/(Math.pow((Math.pow(w,2)-Math.pow(w_0,2)),2) + Math.pow(w,2)*Math.pow(gamma,2)));
        //calculate imaginary refractive index
        //let n_im = (w_d_squared*w*gamma)/(Math.pow((Math.pow(w,2) - Math.pow(w_0,2)),2)+Math.pow(w,2)*Math.pow(gamma,2));

        let k_real = (w*n_real)/c;

        let k_im = (w*n_im)/(c);

        let exp_E = this.element_exponential(math.multiply(-k_im,z_range),size);//exponential decay of amplitude

        let k_z_cos = this.element_cos(math.add(-w_r*t,math.multiply(k_real,z_range)),size);

        let decayed_cos = math.dotMultiply(exp_E,k_z_cos);

        let E_end_amp = this.E_0*exp_E.slice(-1);//find final value of amplitude
        let B_end_amp = this.B_0*exp_E.slice(-1);

        let shift = k_real*1;//phase shift of wave for transmitted wave


        let E_cos_atten,B_cos_atten;

        if (this.polarisation === "s-polarisation") {
            E_cos_atten = [zero, math.multiply(this.E_0, decayed_cos), z_range];
            B_cos_atten = [math.multiply(this.B_0,decayed_cos), zero, z_range];
            }
        else{
            E_cos_atten = [math.multiply(this.E_0, decayed_cos), zero, z_range];
            B_cos_atten = [zero, math.multiply(this.B_0, decayed_cos), z_range];
            }

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
        w_r = parseFloat($("input#angular_frequency").val());
        polarisation_value = $("input[name = polarisation-switch]:checked").val();

        let Incident = new Wave(amplitude,polarisation_value,angular_frequency_ratio,n1);//create wave

        let dielectric_bit = Incident.attenuation(angular_frequency_ratio);//create attenuated wave

        let n_im_max = (w_d_squared*w_0*gamma)/(Math.pow((Math.pow(w_0,2) - Math.pow(w_0,2)),2)+Math.pow(w_0,2)*Math.pow(gamma,2));

        let refectrive_index = dielectric_bit[5]/(1.2*n_im_max);//use refractive index to change opacity of dielectric

        let material_1 = [];
        material_1.push(
            {//dielectric
                opacity: refectrive_index,
                color: '#379F9F',
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

    function compute_data_n() {
        let x = numeric.linspace(0, 2, size);
        let yr = [];
        let yi = [];
        let w;
        let niTot = 0;
        let nrTot = 0;

        for(let i = 0; i< size; i++){
            w = x[i]*w_0;
            niTot = 0;

            for(let i=0; i < w_.length; i++){ //sum contributions to imaginary part of refractive index, from each resonance
                niTot = niTot + (w_d_squared*w*gamma)/(Math.pow((Math.pow(w,2) - Math.pow(w_[i],2)),2)+Math.pow(w,2)*Math.pow(gamma,2));
            }
            yi.push(niTot);
            //yi.push((w_d_squared*w*gamma)/(Math.pow((Math.pow(w,2) - Math.pow(w_1,2)),2)+Math.pow(w,2)*Math.pow(gamma,2))+(w_d_squared*w*gamma)/(Math.pow((Math.pow(w,2) - Math.pow(w_2,2)),2)+Math.pow(w,2)*Math.pow(gamma,2)));
        }

        for( let i = 0; i < size; i++){
            w = (x[i])*w_0;
            nrTot = 0;

            for(let i=0; i < w_.length; i++){ //sum contributions to real part of refractive index, from each resonance
                nrTot = nrTot - (w_d_squared*(Math.pow(w,2)-Math.pow(w_[i],2))/(Math.pow((Math.pow(w,2)-Math.pow(w_[i],2)),2) + Math.pow(w,2)*Math.pow(gamma,2)));
            }
            yr.push(nrTot);

            //yr.push(1 - (w_d_squared*(Math.pow(w,2)-Math.pow(w_1,2))/(Math.pow((Math.pow(w,2)-Math.pow(w_1,2)),2) + Math.pow(w,2)*Math.pow(gamma,2))) - (w_d_squared*(Math.pow(w,2)-Math.pow(w_2,2))/(Math.pow((Math.pow(w,2)-Math.pow(w_2,2)),2) + Math.pow(w,2)*Math.pow(gamma,2))) - 1);
        }

        niTot = 0;
        nrTot = 1;
        for(let i=0; i < w_.length; i++){

            niTot = niTot + (w_d_squared*angular_frequency_ratio*gamma)/(Math.pow((Math.pow(angular_frequency_ratio,2) - Math.pow(w_[i],2)),2)+Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2));
            nrTot = nrTot - (w_d_squared*(Math.pow(angular_frequency_ratio,2)-Math.pow(w_[i],2))/(Math.pow((Math.pow(angular_frequency_ratio,2)-Math.pow(w_[i],2)),2) + Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2)));
        }

        let img_n = niTot;
        let real_n = nrTot;
        //let img_n = (w_d_squared*angular_frequency_ratio*gamma)/(Math.pow((Math.pow(angular_frequency_ratio,2) - Math.pow(w_1,2)),2)+Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2)) + (w_d_squared*angular_frequency_ratio*gamma)/(Math.pow((Math.pow(angular_frequency_ratio,2) - Math.pow(w_2,2)),2)+Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2));
        //let real_n = (1 - (w_d_squared*(Math.pow(angular_frequency_ratio,2)-Math.pow(w_1,2))/(Math.pow((Math.pow(angular_frequency_ratio,2)-Math.pow(w_1,2)),2) + Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2))) - (w_d_squared*(Math.pow(angular_frequency_ratio,2)-Math.pow(w_2,2))/(Math.pow((Math.pow(angular_frequency_ratio,2)-Math.pow(w_2,2)),2) + Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2))));

        let r_in = {
              x: x,
              y: yi,
              type: 'scatter',
              name: 'Im(n)',
        };

        let r_rn = {
              x: x,
              y: yr,
              type: 'scatter',
              name: 'Re(n) - 1',
        };

        let marker_im = {
                x: [parseFloat($("input#angular_frequency").val())],
                y: [img_n],
                showlegend: false,
                type: "scatter",
                mode:"markers",
                name: 'Imaginary n',
                marker: {color: "#002147", size: 12}
        };

        let marker_r = {
                x: [parseFloat($("input#angular_frequency").val())],
                y: [real_n - 1],
                showlegend: false,
                type: "scatter",
                mode:"markers",
                name: 'Real n - 1',
                marker: {color: "#002147", size: 12}
        };

        return [r_rn, r_in, marker_r ,marker_im]
    }

    function compute_data_disp (){ //same but with 2 resonances
    let omega = numeric.linspace(0, 2, size);
        let k = [];
        let n_real = [];
        let w;

        let x = numeric.linspace(0, 2, size);
        let yr = []; //k values
        let yi = [];
        let e1 = 1;
        let e2 = 0;
        let nr; //real part of refractive index

        for( let i = 0; i < size; i++){
            w = (x[i])*w_0;
            e1 = 1; //real part of epsilon
            e2 = 0; //imaginary part of epsilon

            for(let i = 0; i < w_.length; i++){ //sum the contributions from each resonance
                e1 = e1 - (w_d_squared*(Math.pow(w,2)-Math.pow(w_[i],2))/(Math.pow((Math.pow(w,2)-Math.pow(w_[i],2)),2) + Math.pow(w,2)*Math.pow(gamma,2)));
                e2 = e2 + (w_d_squared*w*gamma)/(Math.pow((Math.pow(w_[i],2)- Math.pow(w,2)),2) + Math.pow(gamma,2)*Math.pow(w,2));

            }
            e1 = e1*w;

            //e1 = (w*(1 - (w_d_squared*(Math.pow(w,2)-Math.pow(w_1,2))/(Math.pow((Math.pow(w,2)-Math.pow(w_1,2)),2) + Math.pow(w,2)*Math.pow(gamma,2))) -(w_d_squared*(Math.pow(w,2)-Math.pow(w_2,2))/(Math.pow((Math.pow(w,2)-Math.pow(w_2,2)),2) + Math.pow(w,2)*Math.pow(gamma,2)))));
            //e2 = (w_d_squared*w*gamma)/(Math.pow((Math.pow(w_1,2)- Math.pow(w,2)),2) + Math.pow(gamma,2)*Math.pow(w,2)) + (w_d_squared*w*gamma)/(Math.pow((Math.pow(w_2,2)- Math.pow(w,2)),2) + Math.pow(gamma,2)*Math.pow(w,2));

            n_real = ((1/Math.pow(2,(1/2)))*(e1 + Math.pow((Math.pow(e1,2)+Math.pow(e2,2)),(1/2))));

            yr.push((n_real*w)/(3*Math.pow(10,8)));
        }

        e1 = 1;
        e2 = 0;
        for(let i = 0; i < w_.length; i++){ //sum the contributions from each resonance
            e1 = e1 - (w_d_squared*(Math.pow(angular_frequency_ratio,2)-Math.pow(w_[i],2))/(Math.pow((Math.pow(angular_frequency_ratio,2)-Math.pow(w_[i],2)),2) + Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2)));
            e2 = e2 + (w_d_squared*angular_frequency_ratio*gamma)/(Math.pow((Math.pow(w_[i],2)- Math.pow(angular_frequency_ratio,2)),2) + Math.pow(gamma,2)*Math.pow(angular_frequency_ratio,2));
        }
        e1 = angular_frequency_ratio * e1;

        //e1 = (angular_frequency_ratio*(1 - (w_d_squared*(Math.pow(angular_frequency_ratio,2)-Math.pow(w_1,2))/(Math.pow((Math.pow(angular_frequency_ratio,2)-Math.pow(w_1,2)),2) + Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2))) - (w_d_squared*(Math.pow(angular_frequency_ratio,2)-Math.pow(w_2,2))/(Math.pow((Math.pow(angular_frequency_ratio,2)-Math.pow(w_2,2)),2) + Math.pow(angular_frequency_ratio,2)*Math.pow(gamma,2)))));
        //e2 = (w_d_squared*angular_frequency_ratio*gamma)/(Math.pow((Math.pow(w_1,2)- Math.pow(angular_frequency_ratio,2)),2) + Math.pow(gamma,2)*Math.pow(angular_frequency_ratio,2)) + (w_d_squared*angular_frequency_ratio*gamma)/(Math.pow((Math.pow(w_2,2)- Math.pow(angular_frequency_ratio,2)),2) + Math.pow(gamma,2)*Math.pow(angular_frequency_ratio,2));

        let marker_n = ((1/Math.pow(2,(1/2)))*(e1 + Math.pow((Math.pow(e1,2)+Math.pow(e2,2)),(1/2))));
        let markerK = (marker_n*angular_frequency_ratio)/(3*Math.pow(10,8));


        let trace1 = {
              x: yr,
              y: x,
              type: 'scatter',
              name: 'Dispersion',
              showlegend: false,
        };

        let marker = {
            x: [markerK],
            y: [parseFloat($("input#angular_frequency").val())],
            showlegend: false,
            type: "scatter",
            mode:"markers",
            marker: {color: "#002147", size: 12}
        }

        return [trace1, marker]

    }

    function update_graph_n(){//update refractive index graph

        Plotly.animate("graph_n",
            {data: compute_data_n()},//updated data
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            }
        );

        Plotly.animate("graph_disp",
            {data: compute_data_disp()},//updated data
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

    let resNum = 1;
    function resonanceNumberFunction(){
        extraRes = !extraRes;
        if(resNum==2){extraRes = true;}
        update_graph_n();
        sliderVal = $('');
        console.log(resNum, extraRes);

        if(extraRes){
            w_ = [1.5e10, 3e10]; //change list of resonances
            if(resNum ==2){
                w_ = [1.5e10, 2e10, 3e10];
                $('#resonanceNumber').html('Remove Resonances');//update button text
            }
            update_graph_n();
            $('.sliderTitle').html('Relative Angular Frequency: <span id="angular_frequency-display"></span>');
            $("#angular_frequency-display").html($("input#angular_frequency").val().toString());//update value of slider display
            update_graph(); //updates attenuation
            resNum = resNum+1;

        } else{
            w_ = [2e10];
            update_graph_n();
            $('.sliderTitle').html('Ratio of Angular frequencies: <span id="angular_frequency-display"></span>');
            $("#angular_frequency-display").html($("input#angular_frequency").val().toString());//update value of slider display
            update_graph(); //updates attenuation
            $('#resonanceNumber').html('Add Resonance'); //update button text
            resNum = 1;
        }


    };

    function initial(){
        Plotly.purge("graph");
        Plotly.newPlot('graph', computeData(),plt.layout);//create animation plot

        Plotly.purge("graph_n");
        Plotly.newPlot('graph_n', compute_data_n(),plt.layout_real);//create real refractive index graph

        Plotly.purge("graph_disp");
        Plotly.newPlot('graph_disp', compute_data_disp(), plt.layout_disp);

        dom.pswitch.on("change", update_graph);//update graph animation
        dom.wSlider.on("input",update_graph);
        dom.wSlider.on("input",update_graph_n);//update refractive index graph

        $('#graphChangeButton').on('click', function() {
            nPlot = !nPlot;

            if(nPlot){
                $('#graph_n').show();
                $('#graph_disp').hide();
                $('#graphChangeButton').html('Dispersion Relation');
            } else {
                $('#graph_n').hide();
                $('#graph_disp').show();
                $('#graphChangeButton').html('Refractive Index');
            }
        });

        $('#resonanceNumber').on('click', function() {
                resonanceNumberFunction();
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