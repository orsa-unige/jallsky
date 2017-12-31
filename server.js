#!/usr/bin/env node
/**
 * @file   server.js
 * @author Davide Ricci (davide.ricci82@gmail.com) and Pierre Sprimont
 * @date   2017-12-31
 * 
 * @brief  Manages client data and dispatches messages to the database.
 *
 * 
 */

"use strict";

var ws_mod=require("../ws_protocol_layer/lib/node/ws_server.js");

var http = require('http');    

var config= require('./config.json');   /// Configuration file.
var db_obs= require('./db_obs.js');     /// DB functions.
var schedule =require('./schedule.js'); /// Launches observations.

/// 1) Create http server and listening.
var server = http.createServer(function(request, response) {});

/// 2) Creates a websocket server.
var wss=new ws_mod.server(server);

var auto_expo_on=false;

/// 3) Creates a listener for connections.
var mod_pack={

    abort : function(msg, reply){
	console.log("server: abort in progress...");
	schedule.abort(msg.data, function (){
	    console.log("server: abort done and com port closed! Sending reply...");
	    reply({ msg : "Ok abort done!", x : 3.14159 });	   
	}); 
    },

    start_auto_expo : function(msg, reply){
	var connection = this;

	if(auto_expo_on==true){
	    console.log("server: auto expo already Running!!!");
	    reply({ msg : "server: auto expo already Running. Stop first!", x : 3.14159 });
	    return;
	}else{
	    
	    auto_expo_on=true;
	    reply({ msg : "Ok starting!", x : 3.14159 });

	    console.log("server: auto-expo starting!");
	    schedule.start_auto_expo(msg.data, wss, connection, function (error){
		console.log("server: auto-expo terminated with error. Error is " + error);
		auto_expo_on=false;
	    });
	}
    },

    stop_auto_expo : function(msg, reply){

	
	schedule.stop_auto_expo(function (){
	    console.log("server: stopped auto expos! Sending reply ...");
	    reply({ msg : "Ok stopping !", x : 3.14159 });	   
	}); 
    },
    
    client : function(msg, reply){

	console.log("server: client ws command says it's strating exposure!");
	
	var connection = this;
	var msgjson=msg.data;
	
	var ntrucs=msgjson.nexp;
	
	function do_something(cb){
	    schedule.launch(msgjson, wss, connection, cb);
	} /// do something	    
	
	function done_cb(error, ok){
	    ntrucs--;
	    if(ntrucs>0){
	    	do_something(done_cb);
	     	msgjson.iteration=parseFloat(ntrucs);
	    	console.log("==== Iteration "+msgjson.iteration+" complete ====");
	    }else{
	    	console.log("==== Done all iterations! ====");
	    }
	}
	
	do_something(done_cb);

    }
};

wss.install_mod(mod_pack);

console.log("WS server: handler pack installed OK!");

wss.on("client_event", function(evt){
    if(evt.type=="join"){
	db_obs.last_entry(config.allskycam.collection, function(data){
	    evt.client.send(data.whoami, data); /// Sends the string to the client.
	});
	
    }
    
    if(evt.type=="leave"){
    }
});

wss.on("client_message", function(evt){ //Event sent on each client's incoming message
    wss.broadcast(evt.cmd,evt.data);
});

server.listen(config.ws.port, function(){   /// Same port as client side.
    console.log((new Date()) + ': Server is listening on port '+config.ws.port);
});
