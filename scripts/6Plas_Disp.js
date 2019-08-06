/*jshint esversion: 7 */


class Wave2D{
  
}

class Wave1D{
    constructor(A0, k, omega){
        this.A0 = A0;//Initial amplitude
        this.k = k; //wave "vector"
        this.omega = omega; //angular frequency
    }

    evaluate(xArray, t){
        let A = this.A0;
        let k = this.k;
        let omega = this.omega;
        let CurrentValue;
        let x;
        let Values;

        for (i = 0; i < xArray.length; i++){
            x = xArray[i];
            CurrentValue = Math.complex({r:A, phi:k*x - omega*t});
            Values.push(CurrentValue);
        }
        return Values;
    }
}


function setLayout(sometitlex, sometitley, sometitlez, Mode){
    //set layout of graphs.  'Mode' sets what type of graph you want the layout for
    let new_layout;
    if (Mode == "2D"){
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


function GetGraphData(Omega, k, CurrentOmega, Currentk){
    let Realk = [];
    let Imk = [];
    for (i = 0; i < k.length; i++){
        Realk.push(k[i].re);
        Imk.push(k[i].im);
    }

    let Data = [];

    Data.push({ //push real data
        type: 'scatter',
        mode: "lines",
        name: "Real k",
        line: {color: "red", width: 3},
        x: Realk,
        y: Omega
    });

    Data.push({ //push imaginary data
        type: 'scatter',
        mode: "lines",
        name: "Imaginary k",
        line: {color: "blue", width: 3},
        x: Imk,
        y: Omega
    });

    //if (Currentk[0].re == 0){
    Data.push({ //imaginary point
        type: "scatter",
        mode: "markers",
        name: "Current omega",
        marker: {size: 10, color: "darkblue"},
        x: [Currentk[0].im],
        y: [CurrentOmega]
    });
    //}else{
    Data.push({ //push real point
        type: "scatter",
        mode: "markers",
        name: "Current omega",
        marker: {size: 10, color: "darkred"},
        x: [Currentk[0].re],
        y: [CurrentOmega]
    });
    //}
    
  
    console.log(Data);
    return Data;
}


function UpdatePlots(Data){
    //update plots using react - should be faster than doing newPlot
    Plotly.react('DispersionGraph', Data, setLayout('k', 'Omega', '', 'Scalar'));
}


function NewPlots(Data){
    //create plots using newPlot
    Plotly.newPlot('DispersionGraph', Data, setLayout('k', 'Omega', '', 'Scalar'));
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

    let Omega = numeric.linspace(Omega_min, Omega_max, n);

    let OmegaP = GetOmegaP(Ne);
    UpdateOmegaP(OmegaP);

    let Currentk = DispersionRelation([CurrentOmega], OmegaP);
    // if (Currentk == 0){
    //     Currentk = GetImaginaryk(CurrentOmega);
    // }
    let k = DispersionRelation(Omega, OmegaP);
    
    let GraphData = GetGraphData(Omega, k, CurrentOmega, Currentk);
    
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