module.exports = {
    metadata: {
        family: 'z-wave',
        plugin: 'zWaveNetwork',
        label: 'Z-Wave Network',
        manufacturer: 'Z-Wave',
        discoverable: true,
        additionalSoftware: [{
            name: "Open Z-Wave",
            description: "Free software library that interfaces with selected Z-Wave PC controllers.",
            url: "https://github.com/OpenZWave/open-zwave",
            version: "v1.3"
        }],
        actorTypes: [],
        sensorTypes: [],
        services: [],
        configuration: []
    },
    create: function () {
        return new ZWaveNetwork();
    },
    discovery: function () {
        return new ZWaveNetworkDiscovery();
    }
};

var os = require('os');
var q = require('q');
var _ = require('lodash');
var connectionRequested = false;
var connected = false;

/**
 *
 * @constructor
 */
function ZWaveNetworkDiscovery() {
    /**
     *
     * @param options
     */
    ZWaveNetworkDiscovery.prototype.start = function () {
        if (this.node.isSimulated()) {
            this.timer = setInterval(function () {
            }.bind(this), 20000);
        } else {
            if (!this.zWave) {
                var ZWave = require('openzwave-shared');

                this.zWave = new ZWave({
                    Logging: false,
                    ConsoleOutput: false,
                    SuppressRefresh: false,
                });
            }

            this.nodes = [];

            this.zWave.on('driver ready', function (homeid) {
                this.logDebug('Scanning network with homeid 0x%s...', homeid.toString(16));
                connected = true;
                this.currentHomeId = parseInt("0x" + homeid.toString(16));
            }.bind(this));

            this.zWave.on('driver failed', function () {
                this.logDebug('Failed to start driver.');
                connected = false;
                connectionRequested = false;
                this.zWave.disconnect();
            }.bind(this));

            this.zWave.on('node added', function (nodeId) {
                this.nodes[nodeId] = {
                    manufacturer: "unknown",
                    manufacturerid: "unknown",
                    product: "unknown",
                    producttype: "unknown",
                    productid: "unknown",
                    type: "unknown",
                    name: "unknown",
                    loc: "unknown",
                    ready: false,
                    classes: {}
                };
                this.logDebug('Node added: ' + nodeId);
            }.bind(this));

            this.zWave.on('node ready', function (nodeId, nodeInfo) {
                this.logDebug('Node ready');
                this.logDebug('ID          : ' + nodeId);
                this.logDebug('Type        : ' + nodeInfo.type);
                this.logDebug('Manufacturer: ' + nodeInfo.manufacturer);
                this.logDebug('Product     : ' + nodeInfo.product);
                this.logDebug('Product Type: ' + nodeInfo.producttype);
                this.logDebug('Location    : ' + nodeInfo.loc);

                this.nodes[nodeId].manufacturer = nodeInfo.manufacturer;
                this.nodes[nodeId].manufacturerid = nodeInfo.manufacturerid;
                this.nodes[nodeId].product = nodeInfo.product;
                this.nodes[nodeId].producttype = nodeInfo.producttype;
                this.nodes[nodeId].productid = nodeInfo.productid;
                this.nodes[nodeId].type = nodeInfo.type;
                this.nodes[nodeId].name = nodeInfo.name;
                this.nodes[nodeId].loc = nodeInfo.loc;
                this.nodes[nodeId].ready = true;
            }.bind(this));

            this.zWave.on('scan complete', function () {
                this.logDebug('Scanning complete, adding devices to mesh.');
                // Add the Z-Wave Network Device

                var zWaveNetwork = new ZWaveNetwork();

                if (this.defaultConfiguration) {
                    zWaveNetwork.configuration = _.cloneDeep(this.defaultConfiguration);
                } else {
                    zWaveNetwork.configuration = {};
                }

                zWaveNetwork.id = this.currentHomeId;
                zWaveNetwork.uuid = this.currentHomeId;
                zWaveNetwork.label = "Z-Wave Network " + this.currentHomeId;
                zWaveNetwork.configuration.homeId = this.currentHomeId;
                zWaveNetwork.configuration.nodeId = 1;
                zWaveNetwork.actors = [];

                // Add all ready Nodes depending on their types
                // TODO Add all remaining device classes

                for (n in this.nodes) {
                    this.logDebug("++++++++ ", this.nodes[n].type);

                    var actor;

                    if ((this.nodes[n].type === 'Binary Power Switch') || (this.nodes[n].type === 'Binary Scene Switch')) {
                        this.logDebug("Adding Binary Switch", this.nodes[n]);

                        zWaveNetwork.actors.push(actor = {
                            id: "binaryPowerSwitch" + n,
                            label: "Binary Power Switch " + n,
                            type: "binaryPowerSwitch",
                            configuration: {
                                nodeId: n,
                                deviceType: this.nodes[n].type,
                                manufacturer: this.nodes[n].manufacturer,
                                product: this.nodes[n].product
                            }
                        });
                    } else if (this.nodes[n].type === 'Routing Multilevel Sensor') {
                        this.logDebug("Adding Routing Multilevel Sensor", this.nodes[n]);

                        zWaveNetwork.actors.push(actor = {
                            id: "multilevelSensor" + n,
                            label: "Multilevel Sensor " + n,
                            type: "multilevelSensor",
                            configuration: {
                                nodeId: n,
                                deviceType: this.nodes[n].type
                            }
                        });
                    } else if ((this.nodes[n].type === 'Multilevel Scene Switch') || (this.nodes[n].type === 'Multilevel Power Switch')) {
                        this.logDebug("Adding Multilevel Switch", this.nodes[n]);

                        zWaveNetwork.actors.push(actor = {
                            id: "multilevelSceneSwitch" + n,
                            label: "Multilevel Scene Switch " + n,
                            type: "multilevelSceneSwitch",
                            configuration: {
                                nodeId: n,
                                deviceType: this.nodes[n].type
                            }
                        });
                    } else if (this.nodes[n].type === 'Home Security Sensor') {
                        this.logDebug("Adding Home Security Sensor", this.nodes[n]);

                        zWaveNetwork.actors.push(actor = {
                            id: "homeSecuritySensor" + n,
                            label: "Home Security Sensor " + n,
                            type: "homeSecuritySensor",
                            configuration: {
                                nodeId: n,
                                deviceType: this.nodes[n].type
                            }
                        });
                    } else if (this.nodes[n].type === 'Static PC Controller') {
                        //do nothing
                    } else {
                        this.logDebug("Adding Generic Device", this.nodes[n]);

                        zWaveNetwork.actors.push(actor = {
                            id: "generic" + n,
                            label: "Generic Z-Wave Device " + n,
                            type: "genericDevice",
                            configuration: {
                                nodeId: n,
                                deviceType: this.nodes[n].type
                            }
                        });
                    }
                }

                this.advertiseDevice(zWaveNetwork);
            }.bind(this));

            if (!connected && !connectionRequested) {
                connectionRequested = true;
                this.zWave.connect(getDriverPath());
            }

            // TODO For now, need to be able to switch for Discovery or inherit from Device
            this.logLevel = 'debug';
        }
    };

    /**
     *
     * @param options
     */
    ZWaveNetworkDiscovery.prototype.stop = function () {
        if (this.timer) {
            clearInterval(this.timer);
        }
    };
}

/**
 *
 * @constructor
 */
function ZWaveNetwork() {
    /**
     *
     */
    ZWaveNetwork.prototype.start = function () {
        var deferred = q.defer();
        this.logDebug("****************************");
        this.logDebug("********* HELLOOOO *********");
        this.logDebug("****************************");
        this.logDebug("Simulated: " + this.isSimulated());

        if (this.isSimulated()) {
            this.logDebug("Started Z-Wave Network in simulated mode.");
            deferred.resolve();
        } else {
            this.nodes = Array.apply(null, Array(256)).map(function () {
            });

            this.logDebug("Starting up Z-Wave Device in non-simulated mode.");
            this.logDebug(this.configuration);

            try {
                if (!this.zWave) {
                    this.logDebug("Loading Z-Wave library.");
                    var ZWave = require('openzwave-shared');

                    this.zWave = new ZWave({
                        Logging: true,
                        ConsoleOutput: false,
    //                    PollInterval: 60000,
                        SuppressRefresh: false,
                    });
                    this.logDebug("Z-Wave library loaded.");
                }
            } catch (e) {
                this.logError(e);
            }

            this.zWave.on('driver ready', function (homeid) {
                connected = true;
                this.logDebug('Scanning network with homeid %s...', homeid.toString(16));
            }.bind(this));

            this.zWave.on('driver failed', function () {
                this.logDebug('Failed to start driver.');
                connected = false;
                connectionRequested = false;
                this.zWave.disconnect();
            }.bind(this));

            this.zWave.on('node ready', function (nodeid, nodeinfo) {
                this.logDebug('Node ready  : ' + nodeid);
                this.logDebug('Manufacturer: ' + nodeinfo.manufacturer);
                this.logDebug('Product     : ' + nodeinfo.product);
                this.logDebug('Product Type: ' + nodeinfo.producttype);
                this.logDebug('Location    : ' + nodeinfo.loc);
                this.logDebug('Type        : ' + nodeinfo.type);
                this.logDebug('Begin Classes for Node ' + nodeid);

                for (comclass in this.nodes[nodeid]['classes']) {
                    var values = this.nodes[nodeid]['classes'][comclass];
                    this.logDebug('node' + nodeid + ': class ' + comclass);
                    for (idx in values)
                        this.logDebug('node' + nodeid + ':   ' + values[idx]['label'] + '=' + values[idx]['value']
                            + ' (' + values[idx]['value_id'] + ')');
                }

                this.logDebug('End Classes for Node ' + nodeid);
            }.bind(this));

            this.zWave.on('node added', function (nodeid) {
                this.logDebug('Node added: ' + nodeid);
            }.bind(this));

            this.zWave.on('node available', function (nodeid, nodeinfo) {
                if (!this.nodes[nodeid]) {
                    this.nodes[nodeid] = {};
                }

                this.nodes[nodeid].available = true;
                this.logDebug('Node available: ' + nodeid);
                this.logDebug('Manufacturer  : ' + nodeinfo.manufacturer);
                this.logDebug('Product       : ' + nodeinfo.product);
                this.logDebug('Product Type  : ' + nodeinfo.producttype);
                this.logDebug('Location      : ' + nodeinfo.loc);
                this.logDebug('Type          : ' + nodeinfo.type);
            }.bind(this));

            this.zWave.on('value added', function (nodeid, comclass, value) {
                if (this.nodes[nodeid] && this.nodes[nodeid].unit) {
                    if (!this.nodes[nodeid]['classes']) {
                        this.nodes[nodeid]['classes'] = {};
                    }

                    if (!this.nodes[nodeid]['classes'][comclass])
                        this.nodes[nodeid]['classes'][comclass] = {};
                    this.nodes[nodeid]['classes'][comclass][value.index] = value;
                }
            }.bind(this));

            this.zWave.on('value changed', function (nodeid, comclass, value) {
                if (this.nodes[nodeid] && this.nodes[nodeid].unit) {
                    this.nodes[nodeid].unit.setStateFromZWave(comclass, value);
                }
            }.bind(this));

            this.zWave.on('value refreshed', function (nodeid, comclass, value) {
                if (this.nodes[nodeid] && this.nodes[nodeid].unit) {
                    this.nodes[nodeid].unit.setStateFromZWave(comclass, value);
                }
            }.bind(this));

            this.zWave.on('node event', function (nodeid, event, valueId) {
                if (this.nodes[nodeid] && this.nodes[nodeid].unit) {
                    this.nodes[nodeid].unit.handleEventFromZWave(event, valueId);
                }
            }.bind(this));

            this.zWave.on('notification', function (nodeid, notif, help) {
                if (this.nodes[nodeid] && this.nodes[nodeid].unit) {
                    this.nodes[nodeid].unit.handleNotificationFromZWave(notif, help);
                }
            }.bind(this));

            this.zWave.on('scan complete', function () {
                this.logDebug("Scan complete, notifying actors.");
                var currentNode;

                for (n in this.nodes) {
                    currentNode = this.nodes[n];

                    if (currentNode && currentNode.unit) {
                        try {
                            currentNode.unit.scanComplete();
                        } catch (e) {
                            this.logDebug("Error notyfing node about scan complete", currentNode.unit.configuration, e);
                        } finally {

                        }
                    }
                }
            }.bind(this));

            if (!connected && !connectionRequested) {
                this.logDebug("Connecting to Z-Wave driver.");
                this.logDebug(getDriverPath());
                connectionRequested = true;
                this.zWave.connect(getDriverPath());
                this.logDebug("Connect called.");
            } else {
                this.logDebug("Z-Wave driver already loaded, notufying nodes.");
                var currentNode;

                for (n in this.nodes) {
                    currentNode = this.nodes[n];

                    if (currentNode && currentNode.unit) {
                        try {
                            currentNode.unit.scanComplete();
                        } catch (e) {
                            this.logDebug("Error notyfing node about scan complete", currentNode.unit.configuration, e);
                        } finally {

                        }
                    }
                }
            }

            deferred.resolve();
        }

        return deferred.promise;
    };

    /**
     *
     */
    ZWaveNetwork.prototype.stop = function () {
        var deferred = q.defer();

        if (this.isSimulated()) {
        } else {
            this.zWave.disconnect();
        }

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    ZWaveNetwork.prototype.getState = function () {
        return {};
    };

    /**
     *
     */
    ZWaveNetwork.prototype.setState = function () {
    };
}

var driverPaths = {
    "darwin": '/dev/cu.usbmodem14611',
    "linux": '/dev/ttyACM0',
    "windows": '\\\\.\\COM3'
}

/**
 *
 * @returns {*}
 */
function getDriverPath() {
    console.log(">>>>>>>>>>>>> Driver for " + os.platform());
    return driverPaths[os.platform()];
    //return "/dev/cu.usbmodem1411";
}
