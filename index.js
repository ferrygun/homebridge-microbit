"use strict";

var Service, Characteristic;
var temperatureService;
var GarageDoorOpenerService;
var humidityService;
var request = require("request");
var BBCMicrobit = require('bbc-microbit')

const pin = 0; 
var doorstatus = 0;


console.log('Scanning for microbit');
    BBCMicrobit.discover(function(microbit) {
        console.log('\tdiscovered microbit: id = %s, address = %s', microbit.id, microbit.address);

        microbit.on('disconnect', function() {
            console.log('\tmicrobit disconnected!');
            process.exit(0);
        });

        microbit.on('pinDataChange', function(pin, value) {
            console.log('\ton -> pin data change: pin = %d, value = %d', pin, value);
            if (value == 3) 
                doorstatus = 1; //Closed
            else 
                doorstatus = 0; //Open
        });

        console.log('connecting to microbit');
        microbit.connectAndSetUp(function() {
            console.log('\tconnected to microbit');

            console.log('setting pin %d as input', pin);
            microbit.pinInput(pin, function() {
                console.log('\tpin set as input');

                console.log('setting pin %d as analog', pin);
                microbit.pinAnalog(pin, function() {
                    console.log('\tpin set as analog');

                    console.log('subscribing to pin data');
                
                    microbit.subscribePinData(function() {
                        console.log('\tsubscribed to pin data');
                    });
                });
            });
        });

    });

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-microbit", "microbit", microbitAccessory);
};

function microbitAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
  
}

microbitAccessory.prototype =
    {
        getStateTemp: function (callback) {
            callback(null, doorstatus);
            
        },

       
        identify: function (callback) {
            this.log("Identify requested");
            callback();
        },

        getServices: function () {
            var informationService = new Service.AccessoryInformation();

            informationService
                .setCharacteristic(Characteristic.Manufacturer, "microbit")
                .setCharacteristic(Characteristic.Model, "FD18")
                .setCharacteristic(Characteristic.SerialNumber, "FD18");

            GarageDoorOpenerService = new Service.GarageDoorOpener(this.name);
            GarageDoorOpenerService
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on("get", this.getStateTemp.bind(this));

            

            return [informationService, 
            GarageDoorOpenerService];
            

        },

        
    };
