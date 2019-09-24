/*jshint esversion:6*/
$(window).on('load', function() {//main
    const
    dom = {//assigning switches and slider
        mSwitch:    $("#material-switch input"),
        fSwitch:    $("#field-switch input"),
        vSlider:    $("input#B"),
        rSlider:    $("input#relative_permeability"),
        hSlider:    $("input#dielectric_height")
    },
    plt = {//layout of graph
        layout : {
            showlegend: false,
            showscale: false,
            margin: {
                l: 1, r: 0, b: 0, t: 1, pad: 5
            },
            scene: {
                aspectmode: "cube",
                xaxis: {range: [-1, 1]},
                yaxis: {range: [-1, 1]},
                zaxis: {range: [-1, 1]},
                camera: { eye: {//adjust eye so that more of the capacitor is seen
                    x: 1.8,
                    y: 1.2,
                    z: 0.65,}
                }
            },
        }
    };

    let c_material   = $("input[name = 'material-switch']:checked").val();
    let c_field      = $("input[name = 'field-switch']:checked").val();
    let B     = parseFloat($("input#B").val());
    let relative_p = parseFloat($("input#relative_permeability").val());
    let dielectric_h = parseFloat($("input#dielectric_height").val());

    function make_arrows(pointsx, pointsy, pointsz) {//return data required to construct field line arrows
        /** Returns an arrowhead based on an inputted line */
        var x = pointsx[1],
            y = pointsy[1],
            z = pointsz[[1]],
            u = 0.1 * (pointsx[1] - pointsx[0]),
            v = 0.1 * (pointsy[1] - pointsy[0]),
            w = 0.1 * (pointsz[1] - pointsz[0]);
        return [x, y, z, u, v, w];
    }

    function computeData(){//produces the data for the animation

        $("#B-display").html($("input#B").val().toString()+"T");//update value of slider in html
        $("#relative_permeability-display").html($("input#relative_permeability").val().toString());
        $("#dielectric_height-display").html($("input#dielectric_height").val().toString());

        var data = [];
        if (c_material === "dielectric") {//dielectric only created when required
            let op = Math.abs((relative_p-1)/6);
            data.push(
                {//dielectric
                    opacity: op,
                    color: '#379F9F',
                    type: "mesh3d",
                    name: "dielectric",
                    x: [-1, -1, 1, 1, -1, -1, 1, 1],
                    y: [-1, 1, 1, -1, -1, 1, 1, -1],
                    z: [-dielectric_h, -dielectric_h, -dielectric_h, -dielectric_h, dielectric_h, dielectric_h, dielectric_h, dielectric_h],
                    i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
                    j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
                    k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
                }
            );
        }

        let number_x, number_y;
        let colour,number_of_arrows, linewidth = 10, top_of_arrow = 0.9, bottom_of_arrow = -0.75;
        let E = Math.round((B+4)/10);
        let D = E; //ignore e_0
        if (relative_p == 1) {
            P = 0;
        } else if (relative_p < 1) {
            P = Math.round((1/(relative_p+0.7))*(Math.pow(E,0.5)));
            //P = Math.round(1.5*Math.abs(1/(relative_p+1))*E);
        } else {
            P = Math.round(Math.abs(relative_p/2)*(Math.pow(E,0.5)));
        }

        if (c_material === "vacuum"){
            number_of_arrows = E ;
            if (c_field == "b-field"){
                colour = "#0281d6";
            }
            else if(c_field == "m-field"){
                colour = "#D24000";
            }
            else{
                colour = "#9F004E";
            }
        }else {
            if (c_field == "b-field"){
                number_of_arrows = E ;
                colour = "#0281d6";
            }
            else if(c_field == "m-field"){
                number_of_arrows = P;
                colour = "#D24000";
            }
            else{
                number_of_arrows = D;
                colour = "#9F004E";
            }
        }

        extra_spacing = (1 / number_of_arrows);//value used to position field lines in center of the capacitor

        if ((c_material === "vacuum" && c_field === "b-field") || (c_material === "vacuum" && c_field === "h-field") || (c_material === "dielectric" && c_field === "h-field")) {
            for (let i = 0; i < number_of_arrows; i++) {//used to create grid of field lines hence only square numbers possible
                for (let q = 0; q < number_of_arrows; q++) {
                    number_x = ((2 * (i / number_of_arrows)) - 1) + extra_spacing;
                    number_y = ((2 * (q / number_of_arrows)) - 1) + extra_spacing;
                    data.push({//add trace for line of field line
                        type: "scatter3d",
                        mode: "lines",
                        name: "field line",
                        line: {width: linewidth, color: colour},
                        x: [number_x, number_x],
                        y: [number_y, number_y],
                        z: [top_of_arrow, bottom_of_arrow]
                    });
                    let [x, y, z, u, v, w] = make_arrows([number_x, number_x], [number_y, number_y], [top_of_arrow, bottom_of_arrow]);
                    data.push({//add trace for arrow tip
                        type: "cone",
                        colorscale: [[0, colour], [1, colour]],
                        name: "arrow",
                        x: [x],
                        y: [y],
                        z: [z],
                        u: [u],
                        v: [v],
                        w: [w],
                        sizemode: "absolute",
                        sizeref: 0.2,
                        showscale: false,
                    });
                }
            }
        }
        else if (c_material === "dielectric" && c_field === "m-field") {//various if statements due to position of the field lines within the capacitor
            for (let i = 0; i < number_of_arrows; i++) {
                for (let q = 0; q < number_of_arrows; q++) {
                    if (relative_p > 1){            
                        mid_top_of_arrow = dielectric_h;
                        mid_bottom_of_arrow = -dielectric_h+0.2;
                    } else {
                        mid_top_of_arrow = -dielectric_h;
                        mid_bottom_of_arrow = dielectric_h-0.2;
                    }
                    number_x = ((2 * (i / number_of_arrows)) - 1) + extra_spacing;
                    number_y = ((2 * (q / number_of_arrows)) - 1) + extra_spacing;
                    data.push({
                        type: "scatter3d",
                        mode: "lines",
                        name: "field line",
                        line: {width: linewidth, color: colour},
                        x: [number_x, number_x],
                        y: [number_y, number_y],
                        z: [mid_top_of_arrow, mid_bottom_of_arrow]
                    });
                    mid_top_of_arrow = dielectric_h;
                    mid_bottom_of_arrow = -dielectric_h+0.2;
                    if (relative_p > 1) {
                        [x, y, z, u, v, w] = make_arrows([number_x, number_x], [number_y, number_y], [mid_top_of_arrow, mid_bottom_of_arrow]);
                    } else {
                        [x, y, z, u, v, w] = make_arrows([number_x, number_x], [number_y, number_y], [mid_bottom_of_arrow, mid_top_of_arrow-0.2]);
                    }
                    data.push({
                        type: "cone",
                        colorscale: [[0, colour], [1, colour]],
                        name: "arrow",
                        x: [x],
                        y: [y],
                        z: [z],
                        u: [u],
                        v: [v],
                        w: [w],
                        sizemode: "absolute",
                        sizeref: 0.2,
                        showscale: false,
                    });
                }
            }
        }
        else if (c_material === "dielectric" && c_field === "b-field") {
            top_of_arrow_above = 0.9;
            bottom_of_arrow_above = dielectric_h+0.15;
            mid_top_of_arrow = dielectric_h;
            mid_bottom_of_arrow = -dielectric_h+0.2;
            top_of_arrow_below = -dielectric_h;
            bottom_of_arrow_below = -0.75;
            number_of_arrows_reduced = Math.round(number_of_arrows*Math.pow(relative_p,0.4));

            let extra_space_mod = 1/number_of_arrows_reduced;
            for (let i = 0; i < number_of_arrows_reduced; i++) {
                for (let q = 0; q < number_of_arrows_reduced; q++) {
                    number_x = ((2 * (i / number_of_arrows_reduced)) - 1) + extra_space_mod;
                    number_y = ((2 * (q / number_of_arrows_reduced)) - 1) + extra_space_mod;
                    data.push({
                        type: "scatter3d",
                        mode: "lines",
                        name: "field line",
                        line: {width: linewidth, color: colour},
                        x: [number_x, number_x],
                        y: [number_y, number_y],
                        z: [mid_top_of_arrow, mid_bottom_of_arrow]
                    });
                    let [x, y, z, u, v, w] = make_arrows([number_x, number_x], [number_y, number_y], [mid_top_of_arrow, mid_bottom_of_arrow]);
                    data.push({
                        type: "cone",
                        colorscale: [[0, colour], [1, colour]],
                        name: "arrow",
                        x: [x],
                        y: [y],
                        z: [z],
                        u: [u],
                        v: [v],
                        w: [w],
                        sizemode: "absolute",
                        sizeref: 0.2,
                        showscale: false,
                    });
                }
            }
            for (var i = 0; i < number_of_arrows; i++) {
                for (var q = 0; q < number_of_arrows; q++) {
                    number_x = ((2 * (i / number_of_arrows)) - 1) + extra_spacing;
                    number_y = ((2 * (q / number_of_arrows)) - 1) + extra_spacing;
                    //top arrows
                    data.push({
                        type: "scatter3d",
                        mode: "lines",
                        name: "field line",
                        line: {width: linewidth, color: colour},
                        x: [number_x, number_x],
                        y: [number_y, number_y],
                        z: [top_of_arrow_above, bottom_of_arrow_above]
                    });
                    let [x_1, y_1, z_1, u_1, v_1, w_1] = make_arrows([number_x, number_x], [number_y, number_y], [top_of_arrow_above, bottom_of_arrow_above]);
                    data.push({
                        type: "cone",
                        colorscale: [[0, colour], [1, colour]],
                        name: "arrow",
                        x: [x_1],
                        y: [y_1],
                        z: [z_1],
                        u: [u_1],
                        v: [v_1],
                        w: [w_1],
                        sizemode: "absolute",
                        sizeref: 0.2,
                        showscale: false,
                    });
                    data.push({
                        type: "scatter3d",
                        mode: "lines",
                        name: "field line",
                        line: {width: linewidth, color: colour},
                        x: [number_x, number_x],
                        y: [number_y, number_y],
                        z: [top_of_arrow_below, bottom_of_arrow_below]
                    });
                    let [x_2, y_2, z_2, u_2, v_2, w_2] = make_arrows([number_x, number_x], [number_y, number_y], [top_of_arrow_below, bottom_of_arrow_below]);
                    data.push({
                        type: "cone",
                        colorscale: [[0, colour], [1, colour]],
                        name: "arrow",
                        x: [x_2],
                        y: [y_2],
                        z: [z_2],
                        u: [u_2],
                        v: [v_2],
                        w: [w_2],
                        sizemode: "absolute",
                        sizeref: 0.2,
                        showscale: false,
                    });
                }
            }
        }

        if (data.length < 130) {//animate function requires data sets of the same length hence those unused in situation must be filled with empty traces
            var extensionSize = data.length;// 103 represents the maximum traces necessary 2(top and lower capacitor)+1(dielectric)+25(top field line lines)+25(top field line arrows)+25(bottom field line lines)+25(bottom field line arrows)
            for (var i = 0; i < (130 - extensionSize); ++i) {
                data.push(
                    {
                        type: "scatter3d",
                        mode: "lines",
                        x: [0],
                        y: [0],
                        z: [0]
                    }
                );
            }
        }
        return data;
    }

    function update_graph() {

        c_material   = $("input[name = 'material-switch']:checked").val();
        c_field      = $("input[name = 'field-switch']:checked").val();
        B     = parseFloat($("input#B").val());
        relative_p = parseFloat($("input#relative_permeability").val());
        dielectric_h = parseFloat($("input#dielectric_height").val());

        let new_trace = computeData();

        Plotly.animate("graph",
            {data: new_trace},//updated data
            {
                fromcurrent: true,
                transition: {duration: 0,},
                frame: {duration: 0, redraw: false,},
                mode: "immediate"
            }
        );

    }

    function initial() {//produces initial plot seen on load

        Plotly.newPlot('graph', computeData(), plt.layout);

    }
    initial();//run the initial loading

    dom.mSwitch.on("change", update_graph);//on any change the graph will update
    dom.fSwitch.on("change", update_graph);
    dom.vSlider.on("input", update_graph);
    dom.rSlider.on("input", update_graph);
    dom.hSlider.on("input", update_graph);
});
