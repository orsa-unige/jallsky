/**
 * @file   client.js
 * @author Davide Ricci
 * @date   2017-31-12
 *
 * @brief Grabs information from the webpage and send it to the
 *        server.  d3.js code draws an histogram of the values.
 */

/// Retrieves the configuration file
var config = (function() {
    var config = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "./config.json",
        'dataType': "json",
        'success': function (data) {
            config = data;
        }
    });
    return config;
})();

/**
 *
 * Opening a websocket connection to interact with other users,
 * for example at ws://localhost:1234 (the same port have to be set on
 * the server side).
 *
 */

var ws=new ws_web.server();

var wsc=ws.create_client({
    path : "",             /// need a path for accessing our websocket server?
    port : config.ws.port, /// defaults to same as web server we are connected to
    host : config.ws.ip    /// defaults to same as web server host
});

wsc.on("error",function(e){
    console.log("WS Error=" +e + " DBG: " + e);
});

wsc.on("open", function(){
    console.log("ws opened to " +  wsc.peer.url);
});

ws.install_mod({

    get_bytes : function(msg){ ///,reply){
	footer_output(msg);
    },

    image_data_func : function(msg){
        switch(msg.data.which_progress) {
        case "exposure":
	    $("#exposure_label")
                .text("Exposure:");
	    $("#exposure_progress")
	        .css('width', msg.data.percent+'%')
	        .attr('aria-valuenow', msg.data.percent);
	    $("#exposure_output").val(msg.data.percent);
            break;
        case "transfer":
	    $("#exposure_label")
                .text("Transfer:");
	    $("#exposure_progress")
	        .css('width', msg.data.percent+'%')
	        .attr('aria-valuenow', msg.data.percent);
	    $("#exposure_output").val(msg.data.percent);
            break;
        default:
	    footer_output(msg);
        };
    },

    database : function(msg){
	footer_output(msg);
	update_image(msg.data);
    },

    create_png : function(msg){
	footer_output(msg);
	update_image(msg.data);
    },

    client : function(msg){
	footer_output(msg);
    },

    abort : function(msg){
	footer_output(msg);
    },

    start_auto_expo : function(msg){
	footer_output(msg);
    },

    stop_auto_expo : function(msg){
	footer_output(msg);
    }

});

wsc.connect()
    .then(function(){})
    .catch(function(e){
	footer_output("WS connect error : " + e);
	console.log("WS connect error : " + e);
    });


/// Retrives form data
$("#start").on("click",function(event){
    event.preventDefault();                  /// Avoids the page to reload on click.

    var normaldata=$("form").serializeArray(); /// Takes all the form parameters.

    var compactdata = {};                    /// Compacts them in a "key,value" pair:
    $.each(normaldata, function() {          /// on each element...
	compactdata[this.name] = this.value; /// the name is the value.
    });

    console.log(JSON.stringify(compactdata,undefined,2));

//    console.log("form submit sending command client !");
    wsc.send("client", compactdata);
//    console.log("form submit sending command client DONE!");

});

$("#abort").on("click",function(event){

    var compactdata = {};
    console.log(JSON.stringify(compactdata,undefined,2));
    wsc.query("abort", compactdata, function(reply_data){
	console.log("Abort done! you can take another image ! example data back : " + JSON.stringify(reply_data) );
	footer_output(reply_data);
    });

});

$("#auto").on("click",function(event){

    var normaldata=$("form").serializeArray(); /// Takes all the form parameters.

    var compactdata = { };                   /// Compacts them in a "key,value" pair:
    $.each(normaldata, function() {          /// on each element...
	compactdata[this.name] = this.value; /// the name is the value.
    });

    console.log(JSON.stringify(compactdata,undefined,2));

    // console.log("form submit sending command client !");
    // wsc.send("client", compactdata);
    // console.log("form submit sending command client DONE!");

//    console.log(JSON.stringify(compactdata,undefined,2));
    wsc.query("start_auto_expo", compactdata, function(reply_data){
	console.log("Automatic exposures started! Take esposures until stop.");
	footer_output(reply_data);
    });
});

$("#stop").on("click",function(event){
    var compactdata = {};
//    console.log(JSON.stringify(compactdata,undefined,2));
    wsc.query("stop_auto_expo", compactdata, function(reply_data){
	console.log("Stopped taking automatic exposures.");
	footer_output(reply_data);
    });
});




function update_image(obj){
    if(obj.histo) update_barchart(obj);

    /// Changing min max values and color cuts.
    $("#mincuts").text(obj.histo.start.toFixed(0));
    $("#maxcuts").text(obj.histo.step*obj.histo.data.length.toFixed(0));

    $("#maxist").text(Math.max(...obj.histo.data));
    // $("#minist").text(Math.min(...obj.histo.data))

    $("#iteration").text(obj.iteration);
    $("#total_exp").text(obj.nexp);

	// $("#image h2").text(obj.dateobs)

    /// Filling tags with data
    var datearr=obj.dateobs.split('T'); /// 2017-04-21T18:44:22
    $("#image h2").text(datearr[0]);
    $("#image h3").text(datearr[1]);

    $("#image img").attr("src",obj.pngname);
    $("#image img").attr("alt",obj.dateobs);
    $("#image-jd").text(obj.jd);
    $("#image-exptime").text(obj.exptime);

    //    $("video source").attr("src",'./mnt/output.mp4')

    $("a.fits").attr("href",obj.fitsname);
    $("a.png").attr("href",obj.pngname);

    //	$("pre code").text(JSON.stringify(obj, undefined, 2))

    d3.selectAll("input").on("change",function(){update_barchart(obj)} );

    update_barchart(obj);

}

function footer_output(msg){
    $("footer output").prepend(JSON.stringify(msg)+"<br>");
}
