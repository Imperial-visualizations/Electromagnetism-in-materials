//global constants

const layout = {
    autosize: true,
    margin: {l: 30, r: 40, t: 30, b: 30},
    hovermode: "closest",
    xaxis: {range: [-5, 5], zeroline: true, title: "d"},
    yaxis: {
        range: [0, 305], zeroline: true, title: "$N$", showticklabels: true, tickmode: 'array',
        tickvals: [30, 60, 90, 120, 150, 180, 210, 240, 270,300],
        ticktext: ['n=0','n=1', 'n=2', 'n=3', 'n=4', 'n=5', 'n=6', 'n=7', 'n=8', 'n=9', 'n=10'],
        side: 'right'
    },
    aspectratio: {x: 1, y: 1}
}
function main() {
   //live update of slider display values
   $("input[type=range]").each(function () {
    $(this).on('input', function () {
        $("#" + $(this).attr("id") + "Display").text($(this).val());
        let ReflectionCoeff = $("#ReflectionCoeff").val();
        let DielectricWidth = $("#DielectricWidth").val();
        let NumberOfReflections = $("#NumberOfReflections").val();
        update(ReflectionCoeff, DielectricWidth, NumberOfReflections);
    })
    });
}

function update(ReflectionCoeff, DielectricWidth, NumberOfReflections) {

}

$(window).on('load', main())