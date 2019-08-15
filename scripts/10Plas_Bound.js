//Constants defined first
const e = 2.718281828459045235360287471352662497757247093699959574966967627724076630353;
const pi = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;

let plt = {
    layout: {
        showlegend: false,
        showscale: false,
    xaxis: {
            //x axis attributes here
    },
    yaxis: {
            //y axis attributes here
    },
    }
};
//when you make the new plot, you need to name the div or the id of the div that youre drawing onto
//second thing you parse in is the variable with all the data innit. A function should return this variable
//the third thing you parse in is plt.layout
//data should be specified like so:

function compute_xy(alpha,beta) {
    //calculations done inside the function means that you don't need to parse anything in.
    let x = numeric.linspace(-25, 25, 1000);
    let y = [];
    console.log('cut off should be' , 2 *(Math.cos(beta) ** 2) *(Math.tan(beta) / alpha));
    for (let i = 0; i < x.length; i++) {
        //logic statement(s)
        if (x[i] >  (Math.cos(beta) ** 2) *(Math.tan(beta))/alpha) {
            y.push( - x[i] * Math.tan(beta) + ((Math.cos(beta)**2) * (Math.tan(beta)**2))/alpha );
        } else if (  (Math.cos(beta) ** 2) *(Math.tan(beta) / alpha) >= x[i] && x[i] > 0) {
            y.push( - (alpha / (Math.cos(beta)) ** 2) * (x[i]) ** 2 + Math.tan(beta) * x[i]);
        } else if (x[i] <= 0) {
            y.push(Math.tan(beta) * x[i]);
        } else{
          console.log('well what the fuck is x then', x[i])
        }
    }
    let y_input = {
        x: x, //these to be switched once the above loop works
        y: y,
        type: 'scatter',
        name: 'Imaginary k',
        showlegend: true,};

    return [y_input, y];
}


//to get the graph to update, talk to rob tomorrow.


Plotly.newPlot('graph',compute_xy(),plt.layout);


function initslide() {
    Plotly.purge("graph");
    let initX = numeric.linspace(-25, 25, 1000);
    let initTheta = pi/2;

    $('#DensityController').val(initX);
    $('#DensityControllerDisplay').val(initX);

    $('#Initial_Angle').val(initTheta);
    $('#initial_AngleDisplay').val(initTheta);

    //x = parseFloat(document.getElementById('DensityController').value);
    theta = parseFloat(document.getElementById('Initial_Angle').value);

    Plotly.newPlot("graph", compute_xy(initX), plt);
}
//works up to here 15:40 07/08/19.
function updatePlot() {
    let data = [];
    let alpha = parseFloat(document.getElementById('DensityController').value);
    let beta = parseFloat(document.getElementById('Initial_Angle').value);


    data = compute_xy(alpha,beta);

    Plotly.animate(
        'graph',
        {data: data},
        {
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
            mode: "immediate"
        }
    );
}

function main() {
    initslide();

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
    updatePlot(); //Shows initial positions of vectors
    }

$(document).ready(main);