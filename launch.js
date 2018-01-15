/**
 * @file   launch.js
 * @author Pierre Sprimont and Davide Ricci (davide.ricci82@gmail.com)
 * @date   2017-12-31
 *
 * @brief  AllSky 340M Camera handlers.
 *
 *
 */

"use strict";

var config=require("./config.json"); /// Configuration file.
var allsky_mod=require("./jallsky.js"); /// Camera driver
var write_image=require("./write_image.js"); /// Creating png thumb and fits files

(function(){

    var cam = new allsky_mod.allsky();

    cam.on('open', function(){
        return;
        this.heater_on().catch(function(e){
            console.log("Heater on error : " + e);
        });
    });

    cam.on('close', function(){
        return;
        this.heater_off().catch(function(e){
            console.log("Heater off error : " + e);
        });
    });

    cam.on('error', function(){
        return;
        this.heater_on().catch(function(e){
            console.log("Allsky camera error event : " + e);
        });
    });

    cam.on('disconnect', function(){
        console.log("Allsky camera : serial link disconnected.");
    });

    /**
     *
     *
     * @param params
     * @param cb
     *
     * @return
     */
    async function launch_exposure(params, ws_server, ws){

	console.log("launch_exposure: BEGIN, opening cam...");

        await cam.open();
        await cam.send_test();
        await cam.define_subframe(params);
	await cam.open_shutter();

	console.log("launch_exposure: Shutter opened, ready to expose!");

        var image_data;

        try{
            image_data= await cam.get_image(params , function(message){

		ws_server.broadcast("image_data_func",message); /// To all connected peers!

            });

            console.log("launch_exposure: Got image!");
            await write_image.fits(image_data, params);
            await write_image.png(params);
            await write_image.histo(params);

            ws_server.broadcast("create_png",params);  /// To all connected peers!

        }
        catch(error){
            console.log("launch_exposure: Error Got image or image aborted: "+error);
        }

        await cam.close_shutter();
        await cam.close();

        console.log("launch_exposure: DONE!");

    } /// launch_exposure


    module.exports = {
        cam                  : cam,
        launch_exposure      : launch_exposure
    };

    //FOR TESTING -->

    // launch_exposure()
    // .then(function(){
    //     console.log("Exposure done! ");
    // }).catch(function(e){
    //     console.log("Exposure : " + e);
    // });

}).call(this);
