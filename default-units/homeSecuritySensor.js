module.exports = {
    metadata: {
        plugin: "homeSecuritySensor",
        label: "Home Security Sensor",
        role: "sensor",
        family: "homeSecuritySensor",
        deviceTypes: ["z-wave/zWaveNetwork"],
        events: [{
            id: "motionDetected",
            label: "Motion detected"
        }, {
            id: "noMoreMotion",
            label: "No more Motion"
        }],
        services: [],
        state: [
            {
                id: "motionDetected", label: "Motion Detected",
                type: {
                    id: "boolean"
                }
            }, {
                id: "occupied", label: "Occupied",
                type: {
                    id: "boolean"
                }
            }, {
                id: "fahrenheit", label: "Fahrenheit",
                type: {
                    id: "decimal"
                }
            }, {
                id: "celsius", label: "Celsius",
                type: {
                    id: "decimal"
                }
            }, {
                id: "temperature", label: "Temperature",
                type: {
                    id: "decimal"
                }
            }, {
                id: "luminance", label: "Luminance",
                type: {
                    id: "decimal"
                }
            }, {
                id: "relativeHumidity", label: "Relative Humidity",
                type: {
                    id: "decimal"
                }
            }, {
                id: "batteryLevel", label: "Battery Level",
                type: {
                    id: "integer"
                }
            }
        ],
        configuration: [
            {
                label: "Node ID",
                id: "nodeId",
                type: {
                    id: "integer"
                },
                defaultValue: "1"
            },
            {
                label: "DeviceType",
                id: "deviceType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            },
            {
                label: "Unit",
                id: "unit",
                type: {
                    id: "string"
                },
                defaultValue: "Celsius"
            },
        ]
    },
    create: function () {
        return new HomeSecuritySensor();
    }
};

var q = require('q');

/**
 *
 */
function HomeSecuritySensor() {
    /**
     *
     */
    HomeSecuritySensor.prototype.start = function () {
        var deferred = q.defer();

        if ((this.configuration.unit.toUpperCase) && ("Fahrenheit".toUpperCase() == this.configuration.unit.toUpperCase())) {
            this.configuration.unit = "Fahrenheit";
        } else {
            this.configuration.unit = "Celsius";
        }

        this.logDebug("Unit set to: ", this.configuration.unit);

        if (this.isSimulated()) {
            this.state = {
                motionDetected: false,
                occupied: false,
                temperature: 0,
                luminance: 0,
                relativeHumidity: 0
            };

        } else {
            this.device.nodes[this.configuration.nodeId] = {unit: this};
            this.state = {};
        }

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    HomeSecuritySensor.prototype.setStateFromZWave = function (comClass, value) {
        if (comClass == 48) {
            this.state.motionDetected = value.value;
            this.state.occupied = value.value;
            this.logInfo("Update", value.value_id, value.label, value.value);
            this.logDebug("State", this.state);
            this.publishStateChange();
        } else if (comClass == 49) {
            if (value.label == "Temperature") {
                if (value.units == "F") {
                    this.state.fahrenheit = parseFloat(value.value);

                    if (this.configuration.unit == "Fahrenheit") {
                        this.state.temperature = this.state.fahrenheit;
                    }
                } else if (value.units == "C") {
                    this.state.celsius = parseFloat(value.value);

                    if (this.configuration.unit == "Celsius") {
                        this.state.temperature = this.state.celsius;
                    }
                }
            } else if (value.label == "Luminance") {
                this.state.luminance = parseFloat(value.value);
            } else if (value.label == "Relative Humidity") {
                this.state.relativeHumidity = parseFloat(value.value);
            } else {
                this.logDebug("Ignoring state update.", value.label, value.value);
            }

            this.logInfo("Update", value.value_id, value.label, value.value);
            this.logDebug("State", this.state);
            this.publishStateChange();
        } else if (comClass == 128) {
            this.state.batteryLevel = value.value;
            this.logInfo("Update", value.value_id, value.label, value.value);
            this.logDebug("State", this.state);
            this.publishStateChange();
        } else if (comClass == 134) {
            this.logDebug("Version Info: " + value.label + " " + value.value + " (valueid " + value.value_id + ")");
        } else if (comClass == 94) {
            this.logDebug("Z-Wave Plus Info: " + value.label + " " + value.value + " (valueid " + value.value_id + ")");
        } else if (comClass == 115) {
            this.logDebug("Powerlevel Info: " + value.label + " " + value.value + " (valueid " + value.value_id + ")");
        } else if (comClass == 113) {
            // Info not helpful, redundant to notification with less info.
            // this.logDebug("Alarm Info: " + value.label + " " + value.value + " (valueid " + value.value_id + ")");
        } else if (comClass == 132) {
            this.logDebug("Wake Up Info: " + value.label + " " + value.value + " (valueid " + value.value_id + ")");
        } else if (comClass == 32) {
            this.logDebug("Basic: " + value.label + " " + value.value + " (valueid " + value.value_id + ")");
        } else {
            this.logDebug("Unhandled comClass " + comClass + " with value label " + value.label + " and value "
                + value.value + " (valueid " + value.value_id + ")");
            this.logDebug(value);
        }
    };

    /**
     *
     */
    HomeSecuritySensor.prototype.handleEventFromZWave = function (event, valueid) {
        if (255 == event) {
            this.logInfo("Event - motion detected");
            this.state.motionDetected = true;
            this.state.occupied = true;
            this.publishEvent('motionDetected');
        } else if (0 == event) {
            this.logInfo("Event - no more motion detected");
            this.state.motionDetected = false;
            this.state.occupied = false;
            this.publishEvent('noMoreMotion');
        }

        this.publishStateChange();
    }

    /**
     *
     */
    HomeSecuritySensor.prototype.handleNotificationFromZWave = function (notif, help) {
        this.logDebug(help + " (" + notif + ")");

        if ((notif == 3) || (notif == 4) || (notif == 6)) {
            try {
                this.device.zWave.refreshValue(this.configuration.nodeId, 49, 1, 1);
                this.device.zWave.refreshValue(this.configuration.nodeId, 49, 1, 3);
                this.device.zWave.refreshValue(this.configuration.nodeId, 49, 1, 5);
                this.device.zWave.refreshValue(this.configuration.nodeId, 48, 1, 0);
            } catch (e) {
                this.logDebug(e);
            }
        }
    }

    /**
     *
     */
    HomeSecuritySensor.prototype.scanComplete = function () {
        this.logDebug("Received scan complete.");
        this.device.zWave.enablePoll(this.configuration.nodeId, 49);

        try {
            this.device.zWave.setValue(this.configuration.nodeId, 132, 1, 0, 240);
        } catch (e) {
            this.logError("Error setting update interval to 240s.", e);
        }
    };

    /**
     *
     */
    HomeSecuritySensor.prototype.stop = function () {
        var deferred = q.defer();

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    HomeSecuritySensor.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    HomeSecuritySensor.prototype.setState = function (state) {
        this.logDebug("Ignoring set state call as this is a sensor device and status can only be read.");
    };
};
