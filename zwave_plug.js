/**
 * Created by backes on 07/01/16.
 */

module.exports = {
    metadata: {
        family: "z-wave",
        plugin: "zwave-plug",
        sensorTypes: [],
        state : [{
            id: "plug",
            label : "Switch State",
            type : {
                id : "boolean"
            },

        }],
        services: [{
            id: "switchOn",
            label: "Switch Plug to state On"
        },
            {
                id: "switchOff",
                label: "Switch Plug to state Off"
            }],
        configuration: [{
            id: "home_id",
            label: "Home ID (e.g. ",
            type: { id: "string"},
            default: "4422 1242"
        },
        {
            id: "serialport",
            label : "Serial Port",
            type: {id:"string"},
            default: "/dev/ttyUSB0"
        },
        {
            id: "main_group_id",
            label: "Main Group ID",
            type: {id: "string"},
            default: "34"
        },
        {
            id: "sub_group_id",
            label: "Sub Group ID",
            type: {id: "string"},
            default: "11"
        }]
    },
    create: function (device) {
        return new ZWavePlug();
    }
};

var q = require('q');

var OpenZWave = require('openzwave-shared');


/*
  */


function ZWavePlug() {
    /**
     *
     */
    ZWavePlug.prototype.start = function () {
        var deferred = q.defer();

        this.state = { switch: false};

        if (this.isSimulated()) {
            deferred.resolve();
        } else {



        return deferred.promise;
    };
    /**
     *
     */
    ZWavePlug.prototype.setState = function (state) {
        this.state = state;
    };
    /**
     *
     */
    ZWavePlug.prototype.getState = function () {
        return this.state;
    };
    /**
     *
     */
    ZWavePlug.prototype.switchOn = function () {
        if (this.isSimulated()) {
            console.log("ZWavePlug.switchOn");
            this.state.switch = true;
        }
        else {


            this.state.switch = true;
        }
        this.publishStateChange();
    };
    /**
     *
     */
    ZWavePlug.prototype.switchOff = function () {
        if (this.isSimulated()) {
            console.log("ZWavePlug.switchOff");
            this.state.switch = false;
        }
        else {


            this.state.switch = false;
        }
        this.publishStateChange();
    };
}

