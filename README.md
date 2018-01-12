## jallsky, a node.js way to control an AllSky Camera

**jallsky** is a `node.js` system control for the **SBIG AllSky 340M Camera**.

Its development stage is **in a early phase**, and will be used at the **OARPAF** (*Regional Astronomical Observatory of the Antola Reserve, Fascia*).

It takes inspiration from the following `python` drivers:

 - https://github.com/badders/pyallsky
 - https://github.com/saltastro/skycam

It provides following features:

 - A `node.js` driver to communicate with the camera: 
   it is a `node.js` translation of the `pyallsky` code.
 - A **web page** to control the camera:
   it is a simple interface based on `bootstrap` 4.
 - A link to the [node-fits](https://github.com/Nunkiii/node-fits) and [ws_protocol_layer](https://github.com/Nunkiii/ws_protocol_layer)  github modules:
   `node-fits` allows using data from the AllSky Camera to treate FITS files and png images, and to add custom FITS header keys. It also creates a simple histogram of the values of the image. `ws_protocol_layer` is used as websocket communication protocol.
 - A set of `mongodb` functions to save informations about observations:
   these observations are mainly key headers containing image informations, timing, and filesystem paths of the locations where fits and png images are stored.


## Motivation

This project is born to provide the [OARPAF observatory](http://www.orsa.unige.net) with the best AllSkyCamera system and to help its robotization process.
The final goal is to integrate to dynamically change image cuts; to provide a web interface to dynamically browse the image db, and to  add overlays to the image containing the position of celestial objects and of the OARPAF 80cm telescope during pointing, improving ESO solutions such as the [La Silla AllSky Camera](http://www.ls.eso.org/lasilla/dimm/lasc/). 


# Installation


## Install node and npm if you need it.

From:
http://yoember.com/nodejs/the-best-way-to-install-node-js/

On Linux (other OS are treated in the previous link):

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

nvm list
nvm ls-remote
nvm install 7.10.0
nvm use 7.10.0
nvm alias default 7.10.0
node -v
npm install -g npm
npm -v
```
    
On Mac, add the following line in `.bash_profile`:
    
```bash
source ~/.nvm/nvm.sh
```

## Install some software that will be used

On Debian-based linux distributions:

```bash
sudo apt-get install node node-gyp g++ libpng-dev libjpeg-dev libcfitsio3-dev 
sudo apt-get install mongodb
```

## Install this repository

Clone this repository:
 
```bash
git clone https://github.com/orsa-unige/jallsky.git 
```

Enter in the jallsky directory and then:

```bash
npm -f install 
```

It will install all necessary npm modules as well as the  external `Nunkiii/ws_protocol_layer` module.

## Install other external repositories: 

Clone the external `node-fits` repository.

```bash
git clone https://github.com/Nunkiii/node-fits.git
```

`node-fits` has to be built. In its directory:

```bash
node-gyp configure
node-gyp build
```

## Configuration

`./config.json` and `./header_template.json` contain information about image storing, connection to the database, and FITS  header keys.


# Launch the project

 - Launch the websocket server: `node ./server.2.js`
 - launch a webserver if you need one, such as `python -m SimpleHTTPServer 8000`, and open the html page
 - open the html page and use the camera;


## If you want to modify the page style

Install `ruby`  order to get `sass`, then install `sass`.
On Debian-based distributions:

```bash
    sudo apt-get install ruby ruby-dev
    sudo su -c "gem install sass"
```

Then `sass --watch style.sass:style.css` in order to dinamically compile the `sass` file into `css` at each saving.


### Contributors

Davide Ricci
Pierre Sprimont

### License

This program is free software.
