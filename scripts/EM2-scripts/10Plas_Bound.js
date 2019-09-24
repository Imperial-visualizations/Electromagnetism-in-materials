//Constants defined first
const e = 2.718281828459045235360287471352662497757247093699959574966967627724076630353;
const pi = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;


let layout= {
    showlegend: false,
    showscale: false,
    xaxis: {
        range: [-25,25]
        //x axis attributes here
    },
    yaxis: {
        range: [-20,20]
        //y axis attributes here
    },
    height: 500,
    width: 500
};

//when you make the new plot, you need to name the div or the id of the div that youre drawing onto
//second thing you parse in is the variable with all the data innit. A function should return this variable
//the third thing you parse in is plt.layout
//data should be specified like so:

function compute_xy(alpha,beta,omega) {
    //calculations done inside the function means that you don't need to parse anything in.
    let x = numeric.linspace(-25, 25, 1000);
    let y = [];
    for (let i = 0; i < x.length; i++) {
        //logic statement(s)
        if (x[i] >  ( omega **2 ) *(Math.cos(beta) ** 2) *(Math.tan(beta))/alpha) {
            y.push( - x[i] * Math.tan(beta) +(omega ** 2) * ((Math.cos(beta)**2) * (Math.tan(beta)**2))/alpha );
        } else if (  (omega ** 2) * (Math.cos(beta) ** 2) *(Math.tan(beta) / alpha) >= x[i] && x[i] > 0) {
            y.push( - (alpha / ((omega ** 2) *(Math.cos(beta)) ** 2)) * (x[i]) ** 2 + Math.tan(beta) * x[i]);
        } else if (x[i] <= 0) {
            y.push(Math.tan(beta) * x[i]);
        } else{}
    }
    let y_input = {
        x: x, //these to be switched once the above loop works
        y: y,
        type: 'scatter',
        name: '',
        showlegend: true,
        line: {
            color: "rgb(0,200,0)",
            width: 5,
        },
    };
    return [y_input];
}
function colourgrad(alpha_colour){
    let colourZ = [];
    let y_colour = numeric.linspace(0,20,100);
    let x_colour = numeric.linspace(-25,25,100);
    //let alpha_colour = parseFloat(document.getElementById('DensityController').value);

    for(let i =0;i<y_colour.length; i++){
        let n_e_colour = alpha_colour*y_colour[i];
        colourZ.push(new Array(y_colour.length).fill(n_e_colour))
        }
    let data_colour = {
        z: colourZ,
        x: x_colour,
        y: y_colour,
        type: 'contour'
    };
    return [data_colour];
}

function initslide() {
    Plotly.purge("graph");
    let initX = numeric.linspace(-25, 25, 1000);
    let initTheta = pi/2;

    //x = parseFloat(document.getElementById('DensityController').value) * 2;
    let theta = parseFloat(document.getElementById('Initial_Angle').value);

    let alpha = parseFloat(document.getElementById('DensityController').value);
    let beta = parseFloat(document.getElementById('Initial_Angle').value);
    let omega = parseFloat(document.getElementById('OmegaController').value);

    let plot_data = compute_xy(alpha,beta,omega).concat(colourgrad(alpha));
    Plotly.newPlot("graph", plot_data, layout);
}
function updatePlot() {
    let data = [];
    let alpha = parseFloat(document.getElementById('DensityController').value);
    let beta = parseFloat(document.getElementById('Initial_Angle').value);
    let omega = parseFloat(document.getElementById('OmegaController').value);

    //data = compute_xy(alpha,beta,omega);
    data = compute_xy(alpha,beta,omega).concat(colourgrad(alpha));
    console.log(data);
    Plotly.react('graph', data, layout);
}

function main() {

    /*Jquery*/ //NB: Put Jquery stuff in the main not in HTML
    $("input[type=range]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
            updatePlot(); //Updating the plot is linked with display (Just My preference)
        });

    //Update sliders if value in box is changed


    });

    $("#DensityControllerDisplay").change(function () {
     var value = this.value;
     $("#DensityController").val(value);
     updatePlot();
    });
    $("#Initial_AngleDisplay").change(function () {
    var value1 = this.value1;
    $("#Initial_Angle").val(value1);
    updatePlot();
    });

    /*Tabs*/
    $(function() {
        $('ul.tab-nav li a.button').click(function() {
            var href = $(this).attr('href');
            $('li a.active.button', $(this).parent().parent()).removeClass('active');
            $(this).addClass('active');
            $('.tab-pane.active', $(href).parent()).removeClass('active');
            $(href).addClass('active');

            initslide(href); //re-initialise when tab is changed
            return false;
        });
    });

    //The First Initialisation - I use 's' rather than 'z' :p
    initslide("#basis");
    //updatePlot();
    }

$(document).ready(main);