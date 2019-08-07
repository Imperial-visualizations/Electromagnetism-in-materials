/*jshint esversion:6*/
$(window).on('load', function() {//main

    const
    plt = {//layout of graph
        layout : {
            showlegend: false,
            showscale: true,
            scene: {
                xaxis: {range: [-5, 5]},
                yaxis: {range: [-1.5, 1.5]},

            },
            fromcurrent: true,
            transition: {duration: 0,},
            frame: {duration: 0, redraw: false,},
        }
    };

    var n = 11;
    var x = [], y = [], acc = [], E = [];
    var v = [];
    var t = 0, dt = 0.005;

    for (i = 0; i < n; i++) {
    x[i] = -4 + 0.8*i;
    y[i] = 0;    
    v[i] = 0;
    acc[i] = 0;
    E[i] = 0;
    }

    function initial(){
        Plotly.plot('graph', 
        [{  'name': 'displacement',
            x: x,
            y: y,
            mode: 'markers'},
        {   'name': 'acceleration',
            x: x,
            y: acc,
            line: {simplify: true},},
        {   'name': 'applied E',
            x: x,
            y: E,
            line: {simplify: true},}], 
        {
        xaxis: {range: [-5, 5]},
        yaxis: {range: [-1.5, 1.5]}
        });
    }

    function computeData(){//produces the data for the animation
        let omega = parseFloat($("input#omega").val());
        let epsilon = parseFloat($("input#epsilon").val());
        let sigma = parseFloat($("input#sigma").val());
        let condition =  $("input[name = field-switch]:checked").val();
        console.log(condition);
        $("#omega-display").html($("input#omega").val().toString()+" rad./s");//update value of slider in html
        $("#epsilon-display").html($("input#epsilon").val().toString());
        $("#sigma-display").html($("input#sigma").val().toString());

        t += dt;

        for (var i = 0; i < n; i++) {
            y[i] += v[i] * dt + 0.5 * acc[i] * Math.pow(dt, 2);
            v[i] += acc[i] * dt;
            if (omega == 0){
                E[i] = 0;
                acc[i] = 0;
            } else {
                E[i] = Math.sin(omega*t + x[i]);
                acc[i] = (sigma/epsilon)*Math.sin(omega*t + x[i]);
            }
        }
    }

    function update_graph () {
        computeData();
    
        Plotly.animate('graph', {
            data: [{x: x, y: y}, {x: x, y: acc}, {x: x, y: E}]
        }, plt.layout);

        requestAnimationFrame(update_graph);
    }

    initial();//run the initial loading
    update_graph();//keep graph updated and running
});