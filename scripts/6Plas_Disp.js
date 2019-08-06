/*jshint esversion: 7 */

class Wave1D{
    constructor(A0, k, omega, Phase, Colour){
        this.A0 = A0;//Initial amplitude
        this.k = k; //wave "vector".  can be complex number
        this.omega = omega; //angular frequency
        this.Phase = Phase;
        this.x = [];
        this.y = [];
        this.z = [];
        this.Colour = Colour;
    }

    evaluate(xValues, t, Axis, Plane){
        let Zeroes = [];

        for (i = 0; i<xValues.length; i++){
            Zeroes.push(0);
        }

        let A = this.A0;
        let k = this.k;
        let omega = this.omega;
        let CurrentValue;
        let x;
        let Values = [];

        for (i = 0; i < xValues.length; i++){
            x = xValues[i];
            CurrentValue = math.multiply(math.complex({r: A, phi: (math.add(math.multiply(k.re,x), -omega*t))}), Math.exp(-k.im*x));
            Values.push(CurrentValue.re);
        }
        
        if (Axis == "x"){
            if (Plane == "xy"){
                this.x = xValues;
                this.y = Values;
                this.z = Zeroes;
            }
            if (Plane == "xz"){
                this.x = xValues;
                this.y = Zeroes;
                this.z = Values;
            }
        } 
    }

    GetGraphData(){
        let WaveData = ({
            type: "scatter3d",
            mode: "lines",
            x: this.x,
            y: this.y,
            z: this.z,
            line: {
                width: 6,
                color: this.Colour,
                //reversescale: false
            }
        });

        return WaveData;
    }
}


function setLayout(sometitlex, sometitley, sometitlez, Mode){
    //set layout of graphs.  'Mode' sets what type of graph you want the layout for
    let new_layout;
    if (Mode == "Wave"){
        new_layout = {//layout of 3D graph
            showlegend: false,
            showscale: false,
            uirevision: 'dataset',
            margin: {
                l: 10, r: 10, b: 10, t: 1, pad: 0
            },
            dragmode: 'turntable',
            scene: {
                aspectmode: "cube",
                xaxis: {range: [-100, 100], title: sometitlex, showticklabels: false},
                yaxis: {range: [-100, 100], title: sometitley, showticklabels: false},
                zaxis: {range: [-100, 100], title: sometitlez, showticklabels: false},

                camera: {
                    up: {x: 0, y: 0, z: 1},//sets which way is up
                    eye: {x: 0, y: -1, z: 1}//adjust camera starting view
                }
            },
        };
    }else{//mode = Dispersion
        new_layout = {
            //autosize: true,
            //showlegend: false,
            xaxis: {
                //constrain: "domain",
                //range: [0, 0.00000001],
                title: sometitlex,
                //showticklabels: false
                //title: "Angle"
            },
            yaxis: {
                //scaleanchor: "x",
                //range: [0, 50],
                //showticklabels: false,
                title: sometitley
            },
        };
    }
    return new_layout;
}


function GetGraphData(Omega, k, CurrentOmega, Currentk, xValues, WaveList){
    let Realk = [];
    let Imk = [];


    let EWave = WaveList[0];
    let BWave = WaveList[1];

    

    for (i = 0; i < k.length; i++){
        Realk.push(k[i].re);
        Imk.push(k[i].im);
    }

    let DispersionData = [];

    DispersionData.push({ //push real data
        type: 'scatter',
        mode: "lines",
        name: "Real k",
        line: {color: "red", width: 3},
        x: Realk,
        y: Omega
    });

    DispersionData.push({ //push imaginary data
        type: 'scatter',
        mode: "lines",
        name: "Imaginary k",
        line: {color: "blue", width: 3},
        x: Imk,
        y: Omega
    });

    
    DispersionData.push({ //imaginary point
        type: "scatter",
        mode: "markers",
        name: "Current omega",
        marker: {size: 10, color: "darkblue"},
        x: [Currentk[0].im],
        y: [CurrentOmega]
    });
    
    DispersionData.push({ //push real point
        type: "scatter",
        mode: "markers",
        name: "Current omega",
        marker: {size: 10, color: "darkred"},
        x: [Currentk[0].re],
        y: [CurrentOmega]
    });
    
    let WaveData = [];
    WaveData.push(EWave.GetGraphData());
    WaveData.push(BWave.GetGraphData());

    // WaveData.push({
    //     type: "scatter3d",
    //     mode: "lines",
    //     x: EWave.x,
    //     y: EWave.y,
    //     z: EWave.z,
    //     line: {
    //         width: 6,
    //         color: "blue",
    //         //reversescale: false
    //     }
    // });

    // WaveData.push({
    //     type: "scatter3d",
    //     mode: "lines",
    //     x: BWave.x,
    //     y: BWave.y,
    //     z: BWave.z,
    //     line: {
    //         width: 6,
    //         color: "blue",
    //         //reversescale: false
    //     }
    // });
    
  
    return [DispersionData, WaveData];
}


function UpdatePlots(Data){
    //update plots using react - should be faster than doing newPlot
    Plotly.react('DispersionGraph', Data[0], setLayout('k', 'Omega', '', 'Dispersion'));
    Plotly.react('3DGraph', Data[1], setLayout('x', 'y', 'z', 'Wave'));
}


function NewPlots(Data){
    //create plots using newPlot
    Plotly.newPlot('DispersionGraph', Data[0], setLayout('k', 'Omega', '', 'Dispersion'));
    Plotly.newPlot('3DGraph', Data[1], setLayout('x', 'y', 'z', 'Wave'));
}

function GetWaves(xValues, k){
    let A0 = 10;
    let Phase = 0;
    let omega = (1/50);
    let t = 0;
    k = math.complex({re:(1/10), im:0});
    let EWave = new Wave1D(A0, k, omega, Phase, "blue");
    let BWave = new Wave1D(A0, k, omega, Phase, "red");

    EWave.evaluate(xValues, t, "x", "xy");
    BWave.evaluate(xValues, t, "x", "xz");

    return [EWave, BWave];
}


function DispersionRelation(Omega, OmegaP){
    let c = 3*10**8;
    let k = [];
    let Currentk;
    for (i = 0; i<Omega.length; i++){
        //note we appear to have two math libraries, one called Math and one called math.
        //math does complex numbers apparently.
        Currentk = math.complex(math.multiply((Omega[i]/c), math.sqrt(1 - (OmegaP**2/(Omega[i])**2))));
        k.push(Currentk);
    }
    return k;
}

function GetOmegaP(Ne){
    let e = 1.6e-19;
    let me = 9.11e-31;
    let Epsilon0 = 8.85e-12;

    return Math.sqrt(Ne*e**2/(me*Epsilon0));
}

function UpdateOmegaP(OmegaP){
    document.getElementById('OmegaPDisplay').innerHTML = OmegaP;
    //$("#OmegaPDisplay").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
}

function GetNewInputs(){
    let Ne = document.getElementById("NeSlider").value;
    let CurrentOmega = document.getElementById("OmegaSlider").value;

    return [Ne, CurrentOmega];
}

function Refresh(PlotNew = false){
    let NewVariables = GetNewInputs();
    let Ne = NewVariables[0];
    let CurrentOmega = NewVariables[1];

    let Omega_min = 1;
    let Omega_max = 50;
    let PlotDensity = 10; //per 1 unit
    let n = (Omega_max - Omega_min)*PlotDensity;

    let x_max = 50;
    let x_min = -x_max;
    let PlotDensity3D = 10;
    let n3D = (x_max - x_min)*PlotDensity3D;
    let xValues = numeric.linspace(x_min, x_max, n3D);

    let Omega = numeric.linspace(Omega_min, Omega_max, n);

    let OmegaP = GetOmegaP(Ne);
    UpdateOmegaP(OmegaP);

    let Currentk = DispersionRelation([CurrentOmega], OmegaP);
    
    let WaveList = GetWaves(xValues, Currentk[0]);

    let k = DispersionRelation(Omega, OmegaP);
    
    let GraphData = GetGraphData(Omega, k, CurrentOmega, Currentk, xValues, WaveList);
    
    if (PlotNew){
        NewPlots(GraphData);
    }else{
        UpdatePlots(GraphData);
    }
}



function Initialise() {
    $('#NeSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Refresh();
    });

    $('#OmegaSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        Refresh();
    });

    // $('#Function_Selector_1a').on("input", function(){
    //     //update plots when function is changed
    //     Refresh();
    // });

    Refresh(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}



$(document).ready(Initialise); //Load setup when document is ready.