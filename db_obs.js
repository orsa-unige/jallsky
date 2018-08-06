/**
 * @file   db_obs.js
 * @author Davide Ricci (davide.ricci82@gmail.com)
 * @date   2017-31-12
 *
 * @brief  Fills and reads a database based on mongodb collections.
 *
 *
 */

"use strict";

var config = require('./config.json');
//var message = require('./message.js'); ///

var mongo = require('mongodb');
var db = new mongo.Db(config.mongo.database, new mongo.Server(config.mongo.ip, config.mongo.port, {}), {});

(function(){

    /// Shows last entry
    exports.last_entry = function(coll,cb){
	db.open(function(err, db) {
	    if (err) throw err;
	    console.log("db: opening");
	    db.collection(coll, function(err, collection) {
		if (err) throw err;
		collection.find({}).limit(1).sort({dateobs:-1}).toArray(function(err,result){
		    if (err) throw err;
                    if (result.length === 0){ /// different from 0
                        console.log("the database is empty! Entering something")
                        result[0]={histo:{start:100, step:50, data:[100,200,300,400,500]}};
                    }
		    result[0].whoami="database";
                    
		    //		    connection.send(JSON.stringify(result[0])); /// send the string to the client
		    //		    console.log(JSON.stringify(result[0])); /// send the string to the client
		    cb(result[0]);
		    db.close();
		});
	    });
	});
    };


    /// Shows last n entries
    exports.last_n = function(n,coll,cb){
	db.open(function(err, db) {
	    if (err) throw err;
	    db.collection(coll, function(err, collection) {
		collection.find({}).limit(n).sort({dateobs:-1}).toArray(function(err,result){
		    if (err) throw err;
		    cb(result);
		    db.close();
		});
	    });
	});
    };

    /// Insert a document
    exports.enter = function(doc,coll,cb){
	db.open(function(err, db) {
	    if (err) throw err;
	    db.collection(coll, function(err, collection) {
		doc._id=null; /// Reset to avoid error for duplicate entry. Infame maledetto!
	    	collection.insert(doc, function() {
	    	    console.log("db: inserting");
                    cb(doc);
	    	    db.close(function() {
		    });
	    	});
	    });
	});
    };

    /// Update a document
    exports.update = function(doc,coll,cb){
	db.open(function(err, db) {
	    if (err) throw err;
	    var myquery = { address: "Valley 345" };
	    var newvalues = { name: "Mickey", address: "Canyon 123" };
	    db.collection(coll).update(
		myquery,
		newvalues,
		{}, // options
		function(err, res) {
		    if (err) throw err;
		    console.log(res.result.nModified + " record updated");
		    db.close();
		});
	});
    };


}).call();
