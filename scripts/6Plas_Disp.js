/*jshint esversion: 7 */

var ID;
class Wave1D{
    constructor(A0, k, omega, Phase, Colour, name = "Wavey McWaveface"){
        this.A0 = A0;//Initial amplitude
        this.k = k; //wave "vector".  can be complex number
        this.omega = omega; //angular frequency
        this.Phase = Phase;
        this.x = [];
        this.y = [];
        this.z = [];
        this.Colour = Colour;
        //this.PlotLimits = PlotLimits;
        this.Name = name;
        this.time = 0;
    }

    Evaluate(xValues, Axis, Plane){
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
        let t = this.time;

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

    UpdateValues(NewA0, Newk, Newomega, NewPhase){
        this.A0 = NewA0;
        this.k = Newk;
        this.omega = Newomega;
        this.Phase = NewPhase;
    }

    IncrementTime(TimeStep){
        this.time = this.time + TimeStep;
    }

    GetGraphData(){
        let WaveData = ({
            type: "scatter3d",
            mode: "lines",
            name: this.Name,
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

function setLayout(sometitlex, sometitley, sometitlez, Mode, max_axis){
    //set layout of graphs.  'Mode' sets what type of graph you want the layout for
    let new_layout;
    if (Mode == "Wave"){
        new_layout = {//layout of 3D graph
            //showlegend: false,
            //showscale: false,
            uirevision: 'd',
            margin: {
                l: 1, r: 1, b: 10, t: 1, pad: 0
            },
            dragmode: 'turntable',
            scene: {
                //aspectmode: "cube",
                xaxis: {range: [-0.05, 0.05], title: sometitlex},//, showticklabels: false},
                yaxis: {range: [-0.01, 0.01], title: sometitley},//, showticklabels: false},
                zaxis: {range: [-0.01, 0.01], title: sometitlez},//, showticklabels: false},
                // xaxis: {title: sometitlex},//, showticklabels: false},
                // yaxis: {title: sometitley},//, showticklabels: false},
                // zaxis: {title: sometitlez},//, showticklabels: false},
                
                aspectmode: "manual",
                aspectratio: {
                    x: 5, y: 1, z: 1,
                },

                camera: {
                    up: {x: 0, y: 0, z: 1},//sets which way is up
                    eye: {x: -5, y: -5, z: 3}//adjust camera starting view
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
                range:[-10,350]
                //showticklabels: false
                //title: "Angle"
            },
            yaxis: {
                //scaleanchor: "x",
                //range: [(10**10-5000000000), 10**11],
                range: [0, 10**11],
                //showticklabels: false,
                title: sometitley
            },
        };
    }
    return new_layout;
}


function GetGraphData(Omega, k, CurrentOmega, CurrentkVac, CurrentkPlas, WaveList){
    let Realk = [];
    let Imk = [];


    let EWaveVac = WaveList[0];
    let BWaveVac = WaveList[1];
    let EWavePlas = WaveList[2];
    let BWavePlas = WaveList[3];

    

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
        x: [CurrentkPlas.im],
        y: [CurrentOmega]
    });
    
    DispersionData.push({ //push real point
        type: "scatter",
        mode: "markers",
        name: "Current omega",
        marker: {size: 10, color: "darkred"},
        x: [CurrentkPlas.re],
        y: [CurrentOmega]
    });
    
    let WaveData = [];
    WaveData.push(EWaveVac.GetGraphData());
    WaveData.push(BWaveVac.GetGraphData());
    WaveData.push(EWavePlas.GetGraphData());
    WaveData.push(BWavePlas.GetGraphData());

    WaveData.push(
        {//plasma material block thing
            opacity: 0.5,
            color: 'violet',
            type: "mesh3d",
            name: "plasma",

            x: [0, 0, 0, 0, 0.05, 0.05, 0.05, 0.05],
            y: [0.01, 0.01, -0.01, -0.01, 0.01, 0.01, -0.01, -0.01],
            z: [-0.01, 0.01, 0.01, -0.01, -0.01, 0.01, 0.01, -0.01],
            i: [0, 0, 0, 1, 5, 4, 2, 3, 1, 2, 0, 3],
            j: [1, 2, 1, 4, 6, 5, 3, 6, 2, 5, 3, 4],
            k: [2, 3, 4, 5, 7, 7, 6, 7, 5, 6, 4, 7],
        });
    
    return [DispersionData, WaveData];
}

function GetDispersionData(Omega, k, CurrentOmega, CurrentkPlas, OmegaVac, kVac){
    let Realk = [];
    let Imk = [];

    for (i = 0; i < k.length; i++){
        Realk.push(k[i].re);
        Imk.push(k[i].im);
    }

    let DispersionData = [];



    DispersionData.push({
        type: "scatter",
        mode: "lines",
        name: "Vacuum dispersion",
        line: {color: "orange", width:3},
        x: [kVac[0].re, kVac[1].re],
        y: OmegaVac
    });

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
        x: [CurrentkPlas.im],
        y: [CurrentOmega]
    });
    
    DispersionData.push({ //push real point
        type: "scatter",
        mode: "markers",
        name: "Current omega",
        marker: {size: 10, color: "darkred"},
        x: [CurrentkPlas.re],
        y: [CurrentOmega]
    });
    return DispersionData;
}

function GetWaveData(WaveList){
    let EWaveVac = WaveList[0];
    let BWaveVac = WaveList[1];
    let EWavePlas = WaveList[2];
    let BWavePlas = WaveList[3];

    let WaveData = [];

    WaveData.push(EWaveVac.GetGraphData());
    WaveData.push(BWaveVac.GetGraphData());
    WaveData.push(EWavePlas.GetGraphData());
    WaveData.push(BWavePlas.GetGraphData());

    WaveData.push({//plasma material block thing
        opacity: 0.5,
        color: 'violet',
        type: "mesh3d",
        name: "plasma",

        x: [0, 0, 0, 0, 0.05, 0.05, 0.05, 0.05],
        y: [0.01, 0.01, -0.01, -0.01, 0.01, 0.01, -0.01, -0.01],
        z: [-0.01, 0.01, 0.01, -0.01, -0.01, 0.01, 0.01, -0.01],
        i: [0, 0, 0, 1, 5, 4, 2, 3, 1, 2, 0, 3],
        j: [1, 2, 1, 4, 6, 5, 3, 6, 2, 5, 3, 4],
        k: [2, 3, 4, 5, 7, 7, 6, 7, 5, 6, 4, 7],
    });
    return WaveData;
}


function UpdatePlots(Data, x_max, Omega_max){
    //update plots using react - should be faster than doing newPlot
    Plotly.react('DispersionGraph', Data[0], setLayout('k', 'Omega', '', 'Dispersion', Omega_max));
    Plotly.react('3DGraph', Data[1], setLayout('x', 'y', 'z', 'Wave', x_max));
}


function NewPlots(Data, x_max, Omega_max){
    //create plots using newPlot
    Plotly.newPlot('DispersionGraph', Data[0], setLayout('k', 'Omega', '', 'Dispersion', Omega_max));
    Plotly.newPlot('3DGraph', Data[1], setLayout('x', 'y', 'z', 'Wave', x_max));
}

function GetWaves(NegativexValues, PositivexValues, kVac, kPlas, omega){
    let A0 = 0.01;
    let Phase = 0;
    //let omega = (1/50);
    //let t = 0;

    let EWaveVac = new Wave1D(A0, kVac, omega, Phase, "blue", "E in vacuum");
    let BWaveVac = new Wave1D(A0, kVac, omega, Phase, "red", "B in vacuum");
    let EWavePlas = new Wave1D(A0, kPlas, omega, Phase, "blue", "E in plasma");
    let BWavePlas = new Wave1D(A0, kPlas, omega, Phase, "red", "B in plasma");

    EWaveVac.Evaluate(NegativexValues, "x", "xy");
    BWaveVac.Evaluate(NegativexValues, "x", "xz");
    EWavePlas.Evaluate(PositivexValues, "x", "xy");
    BWavePlas.Evaluate(PositivexValues, "x", "xz");

    return [EWaveVac, BWaveVac, EWavePlas, BWavePlas];
}


function DispersionRelation(Omega, OtherVariables, Medium){
    let c = 3*10**8;
    let k = [];
    let Currentk;
    if (Medium == "Plasma"){
        let OmegaP = OtherVariables[0];
        for (i = 0; i<Omega.length; i++){
            //note we appear to have two math libraries, one called Math and one called math.
            //math does complex numbers apparently.
            Currentk = math.complex(math.multiply((Omega[i]/c), math.sqrt(1 - (OmegaP**2/(Omega[i])**2))));
            k.push(Currentk);
        }
    }else{//medium = "Vacuum"
        for (i = 0; i< Omega.length; i++){
            Currentk = math.complex({re: Omega[i]/c, im:0});
            k.push(Currentk);
        }
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
    OmegaP = OmegaP/10000000000;//account for this change in the html (x10**10)
    document.getElementById('OmegaPDisplay').innerHTML = OmegaP.toFixed(2);
}

function GetNewInputs(){
    let Ne = document.getElementById("NeSlider").value;
    Ne = Ne*10**(17);
    let CurrentOmega = document.getElementById("OmegaSlider").value;
    CurrentOmega = CurrentOmega*10**10;

    let Play = document.getElementById("PlayButton").value;

    return [Ne, CurrentOmega, Play];
}

function Evolve(WaveList, NegativexValues, PositivexValues, TimeStep, Play, Layout1){//adds time evolution
    let EWaveVac = WaveList[0];
    let BWaveVac = WaveList[1];
    let EWavePlas = WaveList[2];
    let BWavePlas = WaveList[3];

    EWaveVac.IncrementTime(TimeStep);
    BWaveVac.IncrementTime(TimeStep);
    EWavePlas.IncrementTime(TimeStep);
    BWavePlas.IncrementTime(TimeStep);

    EWaveVac.Evaluate(NegativexValues, "x", "xy");
    BWaveVac.Evaluate(NegativexValues, "x", "xz");
    EWavePlas.Evaluate(PositivexValues, "x", "xy");
    BWavePlas.Evaluate(PositivexValues, "x", "xz");

    WaveList = [EWaveVac, BWaveVac, EWavePlas, BWavePlas];

    let GraphData = GetWaveData(WaveList);
    //console.log(GraphData);

    Plotly.animate("3DGraph",
        {
            data: GraphData, 
            layout: Layout1 
        },
        {
            fromcurrent: true,
            transition: {duration: 0},
            frame: {duration: 0, redraw: false},
            mode: "immediate"
        }
    );

    // let x_max = 0.05;
    // Plotly.react("3DGraph", GraphData, setLayout('x', 'y', 'z', 'Wave', x_max));

    Play = document.getElementById("PlayButton").value;
    if (Play == "true"){
        ID = window.requestAnimationFrame(function(){Evolve(WaveList, NegativexValues, PositivexValues, TimeStep, Play, Layout1);});
        return;
    }
}

function Refresh(PlotNew = false){
    let NewVariables = GetNewInputs();
    let Ne = NewVariables[0];
    let CurrentOmega = NewVariables[1];
    let Play = NewVariables[2];

    let Omega_min = 1000000000;//10**10;
    let Omega_max = 10**11;
    let PlotDensity = 2/900000000; //per 1 unit
    let n = (Omega_max - Omega_min)*PlotDensity;

    let OmegaVac = [Omega_min, Omega_max];
    let Omega = numeric.linspace(Omega_min, Omega_max, n);

    let OmegaP = GetOmegaP(Ne);
    UpdateOmegaP(OmegaP);

    let CurrentkVac = DispersionRelation([CurrentOmega], [0], "Vacuum")[0];
    let CurrentkPlas = DispersionRelation([CurrentOmega], [OmegaP], "Plasma")[0];
    let k = DispersionRelation(Omega, [OmegaP], "Plasma");
    let kVac = DispersionRelation(OmegaVac, [0], "Vacuum");

    let x_max = 0.05;

    let PlotDensity3D = 10000;



    let x_min = -x_max;
    let n3D = (x_max)*PlotDensity3D;

    let NegativexValues = numeric.linspace(x_min, 0, n3D);
    let PositivexValues = numeric.linspace(0, x_max, n3D);


    
    let WaveList = GetWaves(NegativexValues, PositivexValues, CurrentkVac, CurrentkPlas, CurrentOmega);
    
    let DispersionData = GetDispersionData(Omega, k, CurrentOmega, CurrentkPlas, OmegaVac, kVac);
    let WaveData = GetWaveData(WaveList);
    
    if (PlotNew){
        NewPlots([DispersionData, WaveData], x_max, Omega_max);
    }else{
        UpdatePlots([DispersionData, WaveData], x_max, Omega_max);
    }

    let TimeStep = 0.00000000001;

    if (Play == "true"){
        let Layout1 = setLayout("x", "y", "z", "Wave", x_max);
        ID = window.requestAnimationFrame(function(){Evolve(WaveList, NegativexValues, PositivexValues, TimeStep, Play, Layout1);});
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

    $('#PlayButton').on("click", function(){

        if (document.getElementById("PlayButton").value == "false"){
            document.getElementById("PlayButton").value = "true";
            Refresh();
        }else{
            window.cancelAnimationFrame(ID);
            document.getElementById("PlayButton").value = "false";
        }
    });

    Refresh(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}



$(document).ready(Initialise); //Load setup when document is ready.