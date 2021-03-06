#!/usr/bin/env node
/**
 *
 * Calculate sunset and sunrise time and launch schedule events
 *
 */


var schedule = require('node-schedule');
// var SunCalc = require('suncalc');
var http = require('http');

var ws_mod=require("ws_protocol_layer/lib/node/ws_server.js");
var config= require('./config.json');   /// Configuration file.

//Creation of an outbound server. It is holding all the clients sharing the same set of handlers.

var out_ws=new ws_mod.outbound_server();

out_ws.install_mod({

    image_data_func : function(msg){
	console.log(msg.data.percent);
    },

    database : function(msg){
	
    },

    start_auto_expo : function(msg){
	//footer_output(msg);
    },

    stop_auto_expo : function(msg){
	//footer_output(msg);
    }

});


// client.on("error",function(e){
//     console.log("WS Error=" +e + " DBG: " + e);
// });

// client.on("open", function(){
//     console.log("ws opened to " +  client.peer.url);
// });


// var rule = new schedule.RecurrenceRule();
// rule.second = 10;
console.log("Wait at least 1 minute for noon!");

var j = schedule.scheduleJob("*/4 * * * *", function(){

    console.log("");
    console.log("It's noon! Time to prepare triggers:");
    var today =  new Date();

    console.log(today.toISOString());

    var sunset = new Date(today);
    sunset.setUTCMinutes(sunset.getUTCMinutes() + 1);
    console.log("Sunset will be : "+sunset.toISOString());
        
    var sunrise = new Date(today);
    sunrise.setUTCMinutes(sunrise.getUTCMinutes() + 3);
    console.log("Sunrise will be: "+sunrise.toISOString());

    var compactdata = {};
    
    var tramonto = schedule.scheduleJob(sunset, function(firedate){
        console.log("");
        console.log("It's sunset : "+firedate);
        
        compactdata={
            imagetyp: "light",
            exptime: 2,
            nexp: 1,
            frametyp: "custom",
            size: 120,
            x_start: 260,
            y_start: 180
        };
                
        client.query("start_auto_expo", compactdata, function(reply_data){
	    console.log("Sunset! Taking longer exposures.");
        });
        
    });
        
    var alba = schedule.scheduleJob(sunrise, function(firedate){
        console.log("");
        console.log("It's sunrise: "+firedate);

        client.query("stop_auto_expo", {}, function(reply_data){
	    console.log("Stopping! Take esposures until stop.");
        });
        
    });

    console.log("Waiting for triggers...");
    
});



try{
    //Creating a new websocket client. 
    var client=out_ws.create_client({
        path : "",             /// need a path for accessing our websocket server?
        port : config.ws.port, /// defaults to same as web server we are connected to
        host : config.ws.ip    /// defaults to same as web server host
    });

client.connect();

}
catch(error){
    console.error("Error creating client : " + error);
}
