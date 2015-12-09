![NPM](https://nodei.co/npm/socket-anti-spam.png?downloads=true&downloadRank=true&stars=true)

[ ![Image](https://david-dm.org/michaeldegroot/socket-anti-spam.svg "deps") ](https://david-dm.org/michaeldegroot/socket-anti-spam "david-dm")
[ ![Image](https://travis-ci.org/michaeldegroot/socket-anti-spam.svg?branch=master "testing") ](https://travis-ci.org/michaeldegroot/socket-anti-spam "travis-ci")
[![Coverage Status](https://coveralls.io/repos/michaeldegroot/socket-anti-spam/badge.svg?branch=master&service=github)](https://coveralls.io/github/michaeldegroot/socket-anti-spam?branch=master)
![NPM](https://img.shields.io/badge/Node-%3E%3D0.10-green.svg)
![](https://img.shields.io/npm/dt/socket-anti-spam.svg)
![](https://img.shields.io/npm/l/express.svg)
___
# What it does

Keeps track of how many socket.emit's a ip has submitted under a certain timeframe and determine if it is spammy behaviour.  
If the module determined the user is spamming it will receive a temp ip ban. [Check the module in action via this .gif](https://bitbucket.org/repo/kR4677/images/1013607973-socketspam.gif)
___
# Changelog

https://github.com/michaeldegroot/socket-anti-spam/commits/master
___
#  Getting started

##### 1. Start by installing the package:
    npm install socket-anti-spam

##### 2. Load the code
```javascript
var antiSpam = require('socket-anti-spam');
var antiSpam = new antiSpam({
	spamCheckInterval: 3000, // define in how much miliseconds the antispam script gives a minus spamscore point
	spamMinusPointsPerInterval: 3, // how many minus spamscore points after x miliseconds?
	spamMaxPointsBeforeKick: 9, // needed points before kick
	spamEnableTempBan: true, // Enable the temp ban system (temp ban users after x amount of kicks within x amount of time)
	spamKicksBeforeTempBan: 3, // This many kicks needed for a temp ban
	spamTempBanInMinutes: 10, // This many minutes temp ban will be active
	removeKickCountAfter: 1, // This many minutes until the kick counter is decreasing with 1 for the user
	debug: false // debug? not needed
});
````
	
##### 3. Put this inbetween the on connection event
```javascript
io.sockets.on('connection', function (socket) {
    ...
	antiSpam.onConnect(socket); // Add this line in your on connection event
	...
});
````
Now all sockets will be individually checked if they spam your socket.emits and if they do they will be disconnected, after to many repeated offenses they will be temp banned (ip based).
___
# Contact  
You can contact me at specamps@gmail.com