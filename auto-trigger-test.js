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

// var ws=new ws_web.server();

var ws=new ws_mod.outbound_server();

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

    database : function(msg){
	
    },

    start_auto_expo : function(msg){
	//footer_output(msg);
    },

    stop_auto_expo : function(msg){
	//footer_output(msg);
    }

});


// var today =  new Date();

// var tomorrow = new Date(today);
// tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

// // get today's sunlight times for London
// var times0 = SunCalc.getTimes(today,44,9);
// var times1 = SunCalc.getTimes(tomorrow,44,9);

// console.log("today    : "+today.toISOString())
// console.log("tomor    : "+tomorrow.toISOString())

// console.log("sunset   : "+times0.sunset.toISOString())
// console.log("sunrise  : "+times1.sunrise.toISOString())

// var sunset = new Date(today);
//     sunset.setUTCSeconds(sunset.getUTCSeconds() + 1)


// var sunrise = new Date(today);
//     sunrise.setUTCSeconds(sunrise.getUTCSeconds() + 2)


var rule = new schedule.RecurrenceRule();
rule.second = 10;
console.log("Wait at least 1 minute for noon!");

var j = schedule.scheduleJob(rule, function(){

    console.log("");
    console.log("It's noon! Time to prepare triggers:");
    var today =  new Date();

    console.log(today.toISOString());

    console.log("Sunset will be:");
    var sunset = new Date(today);
    sunset.setUTCMinutes(sunset.getUTCMinutes() + 1);
    console.log(sunset.toISOString());
        
    console.log("Sunrise will be:");
    var sunrise = new Date(today);
    sunrise.setUTCMinutes(sunrise.getUTCMinutes() + 3);
    console.log(sunrise.toISOString());

    var compactdata = {};
    
    var tramonto = schedule.scheduleJob(sunset, function(firedate){
        console.log("It's sunset");
        console.log(firedate);

        compactdata={
            imagetyp: "light",
            exptime: 2,
            nexp: 1,
            frametyp: "custom",
            size: 120,
            x_start: 260,
            y_start: 180
        };
        
        // wsc.query("stop_auto_expo", {}, function(reply_data){
	//     console.log("Stopping! Take esposures until stop.");

        });
            
        wsc.query("start_auto_expo", compactdata, function(reply_data){
	    console.log("Sunset! Taking longer exposures.");
        });

            
        
    });
    
    var alba = schedule.scheduleJob(sunrise, function(firedate){
        console.log("It's sunrise!");
        console.log(firedate);

        compactdata={
            imagetyp: "light",
            exptime: 3,
            nexp: 1,
            frametyp: "full" //,
            // size: 120,
            // x_start: 260,
            // y_start: 180
        };

        wsc.query("stop_auto_expo", {}, function(reply_data){
	    console.log("Stopping! Take esposures until stop.");
        });

        // wsc.query("start_auto_expo", compactdata, function(reply_data){
	//     console.log("Sunrise! Taking shorter exposure.");
        // });
        
    });

    console.log("Waiting for triggers...");
    
});

    
