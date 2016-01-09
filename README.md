# thing-it-device-z-wave

[![NPM](https://nodei.co/npm/thing-it-device-z-wave.png)](https://nodei.co/npm/thing-it-device-z-wave/)
[![NPM](https://nodei.co/npm-dl/thing-it-device-z-wave.png)](https://nodei.co/npm/thing-it-device-z-wave/)

[thing-it-node] Device Plugin for arbitrary Z-Wave networks and their devices.

This allows you to 

* control Z-Wave-enabled devices over the Internet,
* define complex scenes, storyboards and timer controlled execution 

by means of [thing-it-node](https://github.com/marcgille/thing-it-node) and [thing-it.com](http://www.thing-it.com).

As you can combine Z-Wave devices with other devices and can orchestrate scenarios across locations, this goes far beyond what
Z-Wave networks allow you to do with scenes and alerts.

## Installation

### Installation of Open Z-Wave

#### Linux and OSX

You will need to ensure the OpenZWave library and headers are installed first. You can do this one of two ways:

* Downloading the source tarball from the [OpenZWave repository](https://github.com/OpenZWave/open-zwave/releases) and then compiling it and installing on your system via **make** and **sudo make install**.
* You could also install OpenZWave via a precompiled package that's suitable for your Linux distribution and architecture. Notice: Be sure to install BOTH the binary (libopenzwave-x.y) AND the development package (libopenzwave-dev).

#### Windows

Since there is no standard installation location for Open Z-Wave on Windows, it will be automatically downloaded, compiled, and installed when you install 
**openzwave-shared** via **npm** *(see below)*.

### Installation of NodeJS and [thing-it-node]

First, install [nodejs](https://nodejs.org/en/download/) on your computer (e.g. your PC or your Raspberry Pi).

Then install **[thing-it-node]** via

```
npm install -g thing-it-node
```
 
### Initialization and Start of [thing-it-node] 

The **[thing-it-device-z-wave]** Plugin is installed with **[thing-it-node]**, hence there is no need to install it separately.

The Plugin supports Autodiscovery for an existing Z-Wave network and its devices, hence you only have to create a directory in which you intend to run the configuration, e.g.
 
```
mkdir ~/hue-test
cd ~/hue-test
```

and invoke

```
tin init
```

and then start **[thing-it-node]** via

```
tin run
```

Install the **thing-it Mobile App** from the Apple Appstore or Google Play and set it up to connect to **[thing-it-node]** 
locally as described [here](https://thing-it.com/thing-it/#/documentationPanel/mobileClient/connectionModes) or just connect your browser under 
[http://localhost:3001](http://localhost:3001).
 
### Z-Wave Setup

Procure a Z-Wave USB Stick e.g. the (Aeonlab Z-Stick)[http://aeotec.com/z-wave-usb-stick] and connect it to the USB port of your node computer. Make sure that
you have the latest driver installed and identify the device the stick is connected to.

Examples are:

* **/dev/ttyUSB0** on Linux/Mac OS or
* **/dev/cu.SLAB_USBtoUART** on Linux/Mac OS or
* **\\\\.\\COM3** on Windows.

Follow the instructions for your stick to pair Z-Wave devices.

If you start **[thing-it-node]** after configuring your Z-Wave network will automatically add all Z-Wave devices to your **[thing-it-node]** Configuration and 
you will be able control these from the **[thing-it] Mobile App** immediately.

## Mobile UI

The following screenshot shows the Node Page of the [sample configuration]("./examples.configuration"):

<p align="center"><a href="./documentation/images/mobile-ui.png"><img src="./documentation/images/mobile-ui.png" width="70%" height="70%"></a></p>

## Where to go from here ...

After completing the above, you may be interested in

* Configuring additional [Devices](https://www.thing-it.com/thing-it/#/documentationPanel/mobileClient/deviceConfiguration), 
[Groups](https://www.thing-it.com/thing-it/#/documentationPanel/mobileClient/groupConfiguration), 
[Services](https://www.thing-it.com/thing-it/#/documentationPanel/mobileClient/serviceConfiguration), 
[Event Processing](https://www.thing-it.com/thing-it/#/documentationPanel/mobileClient/eventConfiguration), 
[Storyboards](https://www.thing-it.com/thing-it/#/documentationPanel/mobileClient/storyboardConfiguration) and 
[Jobs](https://www.thing-it.com/thing-it/#/documentationPanel/mobileClient/jobConfiguration) via your **[thing-it] Mobile App**.
* Use [thing-it.com](https://www.thing-it.com) to safely connect your Node Box from everywhere, manage complex configurations, store and analyze historical data 
and offer your configurations to others on the **[thing-it] Mesh Market**.
* Explore other Device Plugins like [Texas Instruments Sensor Tag](https://www.npmjs.com/package/thing-it-device-ti-sensortag), [Plugwise Smart Switches](https://www.npmjs.com/package/thing-it-device-plugwise) and many more. For a full set of 
Device Plugins search for **thing-it-device** on [npm](https://www.npmjs.com/). Or [write your own Plugins](https://github.com/marcgille/thing-it-node/wiki/Plugin-Development-Concepts).
