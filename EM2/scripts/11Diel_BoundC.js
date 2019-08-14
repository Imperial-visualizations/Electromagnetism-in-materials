
const dom = {
    tSlider: $("input#thickness"),//Thickness slider
    rfSlider: $("input#refractive_index"),//refractive index slider
    termsSlider: $("input#number_of_terms")
};

let spacing = 2;//spacing between terms on the individual terms graph
let offset = 2;//offset of the first term from the incident wave
let offset_reset = offset;
let data_left = 0,data_center = 0,data_right = 0;

let size = 100;
let t = 0;
let isPlay = false;
let t_ad = 1e9;

let w_0 = 3e8;//gives properties of material
let w = w_0;
let c = 3e8; // Speed of light

let n1 = 1;//material before dielectric
let E_0 = 1;
let width = 10;//width of the graph

//let terms;
let terms = 7;//number of terms shown , balance between accuracy of visulisation and not clarity and too many becomes confusing to look at

let thickness = parseFloat($("input#thickness").val());//set value of thicknes of dielectric
let n2 = parseFloat($("input#refractive_index").val());//set value of the refractive index of dielectric

let offset_max = offset + spacing * terms;

let k_1 = (w*n1)/c;
let k_2 = (w*n2)/c;

let mu_0 = 4*Math.PI*1e-7;
let ep_0 = 8.85*1e-12;

let Z_vac = math.sqrt(mu_0/ep_0)/n1;
let Z_diel = math.sqrt(mu_0/ep_0)/n2;

let rf_v_d = (1-(Z_vac/Z_diel))/(1+(Z_vac/Z_diel));//reflection ampitude coefficient of vacuum to dielectric
let rf_d_v = (1-(Z_diel/Z_vac))/(1+(Z_diel/Z_vac));//reflection ampitude coefficient of dielectric to vacuum
let tr_v_d = 2/(1+ Z_vac/Z_diel);//transmission ampitude coefficient of vacuum to dielectric
let tr_d_v = 2/(1+ Z_diel/Z_vac);//transmission ampitude coefficient of dielectric to vacuum

let x_data = numeric.linspace(0,width,size);
let side = (width-thickness)/2;

let x_data_left = numeric.linspace(0,side,size);//x data from edge to dielectric left hand side
let x_data_center = numeric.linspace(side,side+thickness,size);
let x_data_right = numeric.linspace(side+thickness,width,size);//x data from dielectric right hand side to edge

function shade_dielectric(side, thickness){
    let shapes = [{
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: side,
        y0: 0,
        x1: side + thickness,
        y1: 1,
        fillcolor: '#d3d3d3',
        opacity: 0.4,
        line: {
            width: 0
        }
    }]

    return shapes;
}

class plt_layouts {
    constructor(side, thickness){
        this.side = side;
        this.thickness = thickness;

        this.layout_sum = this.create_layout_sum();
        this.layout_individual = this.create_layout_individual();
        this.layout_trans = this.create_layout_trans();
        this.layout_amp = this.create_layout_amp();

    }

    create_layout_sum(){
        return {
            title: 'Sum of Individual Terms',
            shapes: shade_dielectric(this.side, this.thickness),
            showlegend: false,
            margin: {
                  l: 20,
                  r: 10,
                  b: 25,
                  t: 40,
                  pad: 0
                },
            xaxis: {
              range: [ 0,width],
              zeroline: false,
              showgrid: false,
              showticklabels: false
            },
            yaxis: {
              range: [ -2.3, 2.3],
              zeroline: false,
              showgrid: false,
              showticklabels: false
            },
          }
    }

    create_layout_individual(){
        return {
            title:'Individual Terms',
            shapes: shade_dielectric(this.side, this.thickness),
            showlegend: false,
            margin: {
                l: 20,
                r: 10,
                b: 20,
                t: 25,
                pad: 0
              },
          xaxis: {
            range: [ 0, width],
            zeroline: false,
            showgrid: false,
            showticklabels: false
          },
          yaxis: {
            //range: [ -1.5, 1 + offset_max],
            range: [-1.5, 17],
            zeroline: false,
            showgrid: false,
            showticklabels: false
          },
        }
    }

    create_layout_trans(){
        return {
            title:'Energy Transmission Coefficient vs Thickness',
            showlegend: false,
              margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 40,
                pad: 0
              },
          xaxis: {
            range: [ 0,parseFloat($("#thickness").attr("max"))]
          },
          yaxis: {
            range: [ 0, 1.35]
          },
          }
    }

    create_layout_amp(){
        return {
            title:'Energy Transmission Coefficient of Individual Terms',
              margin: {
                l: 20,
                r: 20,
                b: 20,
                t: 30,
                pad: 0
              },
          xaxis: {
            tick0:0,
            dtick: 1,
            range: [ 0, terms-1 ]
          },
          yaxis: {
            range: [ 0, 1 ]
          },
        }
    }


}

function wave_data_one(){//create incident, reflected and transmitted waves
    let y_data_i = [],y_data_r=[],y_data_t=[];
    for (let i = 0; i < x_data.length; i++) {
        y_data_i.push(E_0 * Math.sin(k_1*x_data_left[i]+ (w*t/t_ad)))//add in time
        y_data_r.push(offset + E_0 * rf_v_d * Math.sin(Math.PI + k_1*side + k_1 * -1 * x_data_left[x_data.length-i] + (w*t/t_ad)));
        y_data_t.push(offset + E_0 * tr_v_d * Math.sin(k_1*side + k_2 * (x_data_center[i]) + (w*t/t_ad)))
    }
    data_left =  math.add(data_left,math.add(y_data_i,math.add(-offset,y_data_r)));
    data_center = math.add(data_center,math.add(-offset,y_data_t));
    offset = offset + spacing ;
    return[[x_data_left,y_data_i],[x_data_left,y_data_r.reverse()],[x_data_center,y_data_t]]
}

function create_waves(){//creates the waves once they are inside the dielectric, hence can have as many terms as we like as only direction and amplitude of waves changes
    let direction = 1;//moving to the right
    let data = [];
    let x_data_r,x_data_t;

    for(let v = 0; v < terms; v++) {
        let y_data_r = [];
        let y_data_t = [];
        let pos;
        for (let i = 0; i < x_data.length; i++) {
            if(direction === 1){
                pos = x_data.length-i;
            }else{
                pos = i;
            }
            y_data_r.push(offset + E_0 * tr_v_d* Math.pow(rf_d_v,(v+1)) * Math.sin(Math.PI + k_1*side + (v+1)*k_2*thickness + k_2 *direction* x_data_center[pos]+ (w*t/t_ad)));
            y_data_t.push(offset + E_0 *tr_v_d * Math.pow(rf_d_v,(v))* tr_d_v * Math.sin(k_1*side + (v+1)*k_2*thickness + k_1 * x_data_left[x_data.length-pos]+ (w*t/t_ad)))
        }
        x_data_r = x_data_center;
        if(direction === 1){
            x_data_t = x_data_right;
            y_data_r = y_data_r.reverse();//reverse the data as it must be plotted from left to right (not calculated like this originally due to phase shift at origin of wave)
            data_right = math.add(data_right,math.add(-offset,y_data_t));
            data_center = math.add(data_center,math.add(-offset,y_data_r));
        }else{
            x_data_t = x_data_left;
            y_data_t= y_data_t.reverse();
            data_left =  math.add(data_left,math.add(-offset,y_data_t));
            data_center = math.add(data_center,math.add(-offset,y_data_r));
        }
        direction = direction*-1; //flip the direction
        offset = offset + spacing ;//add shift up to speparate out the individual terms
        data.push([[x_data_r,y_data_r],[x_data_t,y_data_t]]);
    }
    return [data,[data_left,data_center,data_right]]
}

function plot_data() {//plot traces

    let data_sum = [];
    let data_individual = [];
    let wave_one = wave_data_one();
    let results = create_waves();
    
    let colour;

    for (let v = 0;v<3;v++){//traces of first three waves
        if(v === 0){
            colour = "#A51900"
        }else if(v === 1){
            colour = "#0F8291"
        }else{
            colour = "#02893B"
        }

        data_individual.push({
            type: "scatter",
            mode: "lines",
            x: wave_one[v][0],
            y: wave_one[v][1],
            opacity: 1,
            line: {
                width: 2,
                color: colour,
                reversescale: false}
            })
    }

    for(let i = 0; i < terms;i++){//traces of reflections and tranmission from inside the dielectric
        data_individual.push({
                type: "scatter",
                mode: "lines",
                x: results[0][i][0][0],
                y: results[0][i][0][1],
                opacity: 1,
                line: {
                    width: 2,
                    color: "#0F8291",
                    reversescale: false}
                })
        data_individual.push({
                type: "scatter",
                mode: "lines",
                x: results[0][i][1][0],
                y: results[0][i][1][1],
                opacity: 1,
                line: {
                    width: 2,
                    color: "#02893B",
                    reversescale: false}
                })
    }

    data_sum.push({
            type: "scatter",
            mode: "lines",
            x: x_data_left,
            y: results[1][0],
            opacity: 1,
            line: {
                width: 2,
                color: "#960078",
                reversescale: false}

    });
    data_sum.push({
            type: "scatter",
            mode: "lines",
            x: x_data_center,
            y: results[1][1],
            opacity: 1,
            line: {
                width: 2,
                color: "#960078",
                reversescale: false}

    });
    data_sum.push({
            type: "scatter",
            mode: "lines",
            x: x_data_right,
            y: results[1][2],
            opacity: 1,
            line: {
                width: 2,
                color: "#960078",
                reversescale: false}

    });
    offset = offset_reset;
    data_left = 0;
    data_center = 0;
    data_right = 0;
return [data_sum,data_individual]
}

function plot_data_transmission(){
    let transmission = [];
    let x_input = numeric.linspace(0,parseFloat($("#thickness").attr("max")),1000);
    let R = Math.pow(rf_v_d,2);
    $("#energy_reflection_coefficient-display").html(R.toFixed(2));//Display new value of R

    for(let i = 0;i<x_input.length;i++){
        transmission.push(1/(1+(Math.pow(Math.sin(x_input[i]*k_2),2)*((4*R))/((1-R)^2))));
    }

    let T = 1/(1+(Math.pow(Math.sin(thickness*k_2),2)*(4*R))/((1-R)^2));
    $("#energy_transmission_coefficient-display").html(T.toFixed(2));//Display new value of T

    let transmission_line = {
          x: x_input,
          y: transmission,
          type: 'scatter',
          name: 'Energy Transmission Coefficient',
    };

    let marker = {//marks the current thickness selected
            x: [thickness],
            y: [T],
            showlegend: false,
            type: "scatter",
            mode:"markers",
            name: 'Energy Transmission Coefficient',
            marker: {color: "#002147", size: 12}
    };
    return [transmission_line,marker]
}

function plot_data_amplitude(){//creates data for amplitude of individual transmitted waves, showing their rapid decay in magnitude
    let amplitude = [];
    let x_input = numeric.linspace(0,terms);
    let even = [];
    let odd = [];
    for (let i = 0; i < 2*terms; i++){
        if ((i % 2) == 0){
            even.push(i)
        }else{
            odd.push(i)
        }
    }

    for(let i = 0;i<x_input.length;i++){
        amplitude.push(Math.abs(tr_v_d*tr_d_v*Math.pow(rf_d_v,even[i])*Math.cos(odd[i]*thickness*k_2)*E_0));
    }


    let amplitude_line = {
          x: x_input,
          y: amplitude,
          type: 'scatter',
          name: 'Ampltude of Transmission',
    };
    return [amplitude_line]
}

function AnimateAll(data, plt){

    Plotly.animate("graph_sum",
        {
            data: data[0],
            layout: plt.layout_sum
        },//updated data
        {
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
            mode: "immediate"
        }
    );

    Plotly.animate("graph_individual",
        {
            data: data[1],
            layout: plt.layout_individual
        },//updated data
        {
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
            mode: "immediate"
        }
    );

    Plotly.animate("graph transmission",
        {data: plot_data_transmission()},//updated data
        {
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
            mode: "immediate"
        }
    );

    Plotly.animate("graph amplitude",
        {data: plot_data_amplitude()},//updated data
        {
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
            mode: "immediate"
        }
    );
    }


function update_graphs(){//update animation
    thickness = parseFloat($("input#thickness").val());
    n2 = parseFloat($("input#refractive_index").val());
    terms = parseInt($("input#number_of_terms").val());

    $("#number_of_terms-display").html(terms);
    $("#thickness-display").html(thickness);//update display
    $("#refractive_index-display").html(n2);

    offset_max = 2*spacing + spacing * terms;

    k_2 = (w*n2)/c;
    Z_diel = math.sqrt(mu_0/ep_0)/n2;

    rf_v_d = (1-(Z_vac/Z_diel))/(1+(Z_vac/Z_diel));
    rf_d_v = (1-(Z_diel/Z_vac))/(1+(Z_diel/Z_vac));
    tr_v_d = 2/(1+ Z_vac/Z_diel);
    tr_d_v = 2/(1+ Z_diel/Z_vac);

    side = (width-thickness)/2;
    x_data_left = numeric.linspace(0,side,size);
    x_data_center = numeric.linspace(side,side+thickness,size);
    x_data_right = numeric.linspace(side+thickness,width,size);

    let data = plot_data();

    let plt = new plt_layouts(side, thickness);

    AnimateAll(data, plt);

};

function play_loop(){//adds in time to visulisation

    if(isPlay === true) {

        let data = plot_data();
        t++;
        Plotly.animate("graph_sum",
            {data: data[0]},
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            });
        Plotly.animate("graph_individual",
            {data: data[1]},
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            });

        requestAnimationFrame(play_loop);//loads next frame
    }
    return 0;
};


function initial() {
    thickness = $("input#thickness").val();
    terms = $("input#number_of_terms").val();
    n2 = $("input#refractive_index").val();

    $("#number_of_terms-display").html(terms);//update display
    $("#thickness-display").html(thickness);//update display
    $("#refractive_index-display").html(n2);

    let plt = new plt_layouts(side, thickness);

    let data = plot_data();

    Plotly.purge("graph_sum");
    Plotly.newPlot('graph_sum', data[0],plt.layout_sum);//create animation

    Plotly.purge("graph_individual");
    Plotly.newPlot('graph_individual', data[1],plt.layout_individual);//create animation

    Plotly.purge("graph transmission");
    Plotly.newPlot('graph transmission', plot_data_transmission(), plt.layout_trans);//create animation

    Plotly.purge("graph amplitude");
    Plotly.newPlot('graph amplitude', plot_data_amplitude(),plt.layout_amp);//create animation

    dom.tSlider.on("input", update_graphs);
    dom.rfSlider.on("input", update_graphs);
    dom.termsSlider.on("input", update_graphs);

    $('#playButton').on('click', function() {
        document.getElementById("playButton").value = (isPlay) ? "Play" : "Stop";//change play/stop label
        isPlay = !isPlay;
        t = 0;//reset time
        requestAnimationFrame(play_loop);
    });
}


//main
function main(){
    initial();
    //dirty fix - see why dielectric not being drawn properly with just initial
    update_graphs();
}


$(window).on('load', main);