/**
 * @file   create-png.js
 * @author Pierre Sprimont and Davide Ricci (davide.ricci82@gmail.com)
 * @date   2018-01-15
 *
 * @brief  Creation of png images
 *
 *
 */

var julian = require("julian");      /// Julian Date conversion.
var fs=require("fs");                /// File stream for writing with node-fits.

var fits = require('./node_modules/node-fits/build/Release/fits'); /// Manages fits files.
//var fits = require('../node-fits/build/Release/fits'); /// Manages fits files.
var config= require('./config.json');   /// Configuration file.

(function(){


    /**
     *
     *
     * @param data
     * @param params
     *
     * @return
     */
     function write_fits(data,params){

        console.log("write_fits called");
        
        var now      = new Date(); /// Time stamp to be used for file names, DATE-OBS and JD
        var dateobs  = now.toISOString().slice(0,-5);  /// string
        var jd       = parseFloat(julian(now));        /// double

        var fitsname = config.fits.dir+dateobs+".fits";

        var fifi     = new fits.file(fitsname);
        var M        = new fits.mat_ushort;

        M.set_data(params.width,params.height,data);
//        fifi.file_name;
        fifi.write_image_hdu(M);

        var h=require(config.allskycam.header.template); /// Loading json containing the header template

        /// Filling variable header keys.
        h.find(x => x.key === 'DATE-OBS').value = dateobs;
        h.find(x => x.key === 'JD'      ).value = jd;
        h.find(x => x.key === 'EXPTIME' ).value = params.exptime;
        h.find(x => x.key === 'IMAGETYP').value = params.imagetyp;
        h.find(x => x.key === 'FRAMETYP').value = params.frametyp;
        h.find(x => x.key === 'BINNING' ).value = params.frametyp == 'binned' ? parseInt(2) : parseInt(1);
        h.find(x => x.key === 'SUBFRAME').value = params.frametyp == 'custom'
            ? "["+[params.x_start, params.y_start, params.size].toString()+"]" : '';

        /// Filling fixed header keys.
        fifi.set_header_key(h, err => {if(err!==undefined) console.log("Error setting fits header: "+err);});

        var post = {jd:jd, dateobs:dateobs, exptime:params.exptime, fitsname:fitsname };

        Object.assign(params, post);

    } /// write_fits

    /**
     *
     *
     * @param data
     * @param params
     *
     * @return
     */
   function write_png(params){
      
      console.log("write_png called");

        var pngname  = config.png.dir+params.dateobs+".png";

        return new Promise(function(ok, fail){

            /// The file is automatically opened (for reading) if the
            /// file name is specified on constructor.
            var f = new fits.file(params.fitsname); 

            f.get_headers(function(error, headers){

                if(error){
                    fail("Bad things happened : " + error);
                }else{

                    f.read_image_hdu(function(error, image){

                        if(error)
                            fail("Bad things happened while reading image hdu : " + error);
                        else{

                            if(image){

                                console.log("Image size : " + image.width() + " X " + image.height());

                                var colormap=config.png.colormap;
                                ///R  ///G  ///B  ///A  ///level: 0=min,1=max
                                // [
                                // [0.0, 0.0, 0.0, 1.0, 0.0],
                                // [0.4, 0.4, 0.4, 1.0, 0.8],
                                // [0.8, 0.8, 0.8, 1.0, 0.9],
                                // [1.0, 1.0, 1.0, 1.0, 1.0]
                                // ];

                                var cuts=config.png.cuts; /// [11000,40000] for 25s
                                
                                image.set_colormap(colormap);
                                image.set_cuts(cuts);
                                
                                params.pngname=pngname;
                                
                                var out = fs.createWriteStream(pngname);
                                out.write(image.tile( { tile_coord :  [0,0],
                                                        zoom :  0,
                                                        tile_size : [image.width(),image.height()],
                                                        type : "png"
                                                      }));
                                out.end();
                                
                                ok();

                            }else fail("No image returned and no error ?");
                        }
                    });
                }
            }); ///get_headers
        });//Promise
    } /// write_png


    /**
     *
     *
     * @param data
     * @param params
     *
     * @return
     */
   function add_histo(params){
      
      console.log("add_histo called");

        return new Promise(function(ok, fail){

            /// The file is automatically opened (for reading) if the
            /// file name is specified on constructor.
            var f = new fits.file(params.fitsname); 

            f.get_headers(function(error, headers){

                if(error){
                    fail("Bad things happened : " + error);
                }else{

                    f.read_image_hdu(function(error, image){

                        if(error)
                            fail("Bad things happened while reading image hdu : " + error);
                        else{

                            if(image){

                                //nbins:50
                                image.histogram({}, function(error, histo){
                                    if(error)
                                        fail("Histo error : " + error);
                                    else{
                                        params.histo=histo;
                                    }
                                });
                                
                                ok();

                            }else fail("No image returned and no error ?");
                        }
                    });
                }
            }); ///get_headers
        });//Promise
    } /// add_histo

    
    module.exports = {
        fits  : write_fits,
        png   : write_png,
        histo : add_histo
    };

}).call(this);
