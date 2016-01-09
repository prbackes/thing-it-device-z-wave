module.exports = {
    metadata: {
        plugin: "binaryPowerSwitch",
        label: "Z-Wave Binary Power Switch",
        role: "actor",
        family: "binaryPowerSwitch",
        deviceTypes: ["z-wave/zWaveNetwork"],
        services: [{
            id: "on",
            label: "On"
        }, {
            id: "off",
            label: "Off"
        }, {
            id: "toggle",
            label: "Toggle"
        }],
        state: [
            {
                id: "switch", label: "Switch",
                type: {
                    id: "boolen"
                }
            }],
        configuration: [{
            label: "Node ID",
            id: "nodeId",
            type: {
                id: "integer"
            },
            defaultValue: "1"
        }]
    },
    create: function () {
        return new BinaryPowerSwitch();
    }
};

var q = require('q');

/**
 *
 */
function BinaryPowerSwitch() {
    /**
     *
     */
    BinaryPowerSwitch.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            switch: false
        };

        this.device.nodes[this.configuration.nodeId] = {unit: this};

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.setStateFromZWave = function (comClass, value) {
        this.logDebug("Set State");

        if (comClass == 37) {
            this.state.switch = value.value;

            this.logDebug("State", this.state);
            this.publishStateChange();
        }
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.stop = function () {
        var deferred = q.defer();

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.setState = function (state) {
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.on = function () {
        this.logDebug("Called on()");

        if (this.isSimulated()) {

        } else {
            this.device.zWave.setValue(this.configuration.nodeId, 37, 1, 0, true);

            this.publishStateChange();
        }
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.off = function () {
        this.logDebug("Called off()");

        if (this.isSimulated()) {

        } else {
            this.device.zWave.setValue(this.configuration.nodeId, 37, 1, 0, false);

            this.publishStateChange();
        }
    };

    /**
     *
     */
    BinaryPowerSwitch.prototype.toggle = function () {
        this.device.zWave.setValue(this.configuration.nodeId, 4, 40);
    };
};
