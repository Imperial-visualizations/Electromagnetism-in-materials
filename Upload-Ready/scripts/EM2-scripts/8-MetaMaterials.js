//main
function displayImage(){
    let picture = $("input[name = wave-switch]:checked").val();

    if (picture === "NIM") {
    document.getElementById("NIMImage").style.display = "block";
    document.getElementById("CloakingImage").style.display = "none"
    } else if (picture === "Cloaking"){
    document.getElementById("NIMImage").style.display = "none";
    document.getElementById("CloakingImage").style.display = "block"
    };
}

function main(){
//jQuery to update the plot as the value of the slider changes.
    document.getElementById("NIMImage").style.display = "block";
    document.getElementById("CloakingImage").style.display = "none";
    $("input[type=radio]").each(function () {
        /*Allows for live update for display values*/
        $(this).on('input', function(){
            //Displays: (FLT Value) + (Corresponding Unit(if defined))
//            $("#"+$(this).attr("id") + "Display").val( $(this).val());
            //NB: Display values are restricted by their definition in the HTML to always display nice number.
        displayImage();
        });
    });
}

$(document).ready(main); //Load setup when document is ready.