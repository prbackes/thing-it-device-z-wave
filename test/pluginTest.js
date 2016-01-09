var assert = require("assert");

describe('[thing-it] Z-Wave', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "error"});

        testDriver.registerDevicePlugin(__dirname + "/../zWaveNetwork");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/multilevelSensor");
    });
    describe('Start Configuration', function () {
        this.timeout(20000);

        it('should complete without error', function () {
            return testDriver.start({
                configuration: require("../examples/configuration.js"),
                heartbeat: 10
            });
        });
    });
    describe('Switch Discovery', function () {
        this.timeout(20000);

        before(function () {
            testDriver.removeAllListeners();
        });
        it('should produce Device Discovery message', function (done) {
            testDriver.addListener({
                publishDeviceRegistration: function (device) {
                    done();
                }
            });
        });
    });
});





