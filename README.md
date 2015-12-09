[![](https://nodei.co/npm/socket-anti-spam.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/socket-anti-spam)     
[![](https://david-dm.org/michaeldegroot/socket-anti-spam.svg "deps") ](https://david-dm.org/michaeldegroot/socket-anti-spam "david-dm")
[![](https://travis-ci.org/michaeldegroot/socket-anti-spam.svg?branch=master "testing") ](https://travis-ci.org/michaeldegroot/socket-anti-spam "travis-ci")
[![](https://coveralls.io/repos/michaeldegroot/socket-anti-spam/badge.svg?branch=master&service=github)](https://coveralls.io/github/michaeldegroot/socket-anti-spam?branch=master)
![](https://img.shields.io/badge/Node-%3E%3D0.10-green.svg)
![](https://img.shields.io/npm/dt/socket-anti-spam.svg)
![](https://img.shields.io/npm/l/express.svg)
___
# What it does

Keeps track of how many socket.emit's a ip has submitted under a certain timeframe and determine if it is spammy behaviour.  
If the module determined the user is spamming it will receive a temp ip ban. 

[You can see a demo of the module in action here](https://bitbucket.org/repo/kR4677/images/1013607973-socketspam.gif)
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
	spamCheckInterval: 3000,        // in how many miliseconds do users get -1 spamscore point
	spamMinusPointsPerInterval: 3,  // how many spamscore points must be added after the spamCheckInterval?
	spamMaxPointsBeforeKick: 9,     // needed spamscore points before kick
	spamEnableTempBan: true,        // Enable temp bans (ban users after x amount of kicks within x amount of time)
	spamKicksBeforeTempBan: 3,      // This many kicks needed for a temp ban
	spamTempBanInMinutes: 10,       // This many minutes temp ban will be active
	removeKickCountAfter: 1,        // This many minutes until the kick counter is decreasing with 1 for the user
	debug: false                    // debug? not needed unless you have problems :)
});

io.sockets.on('connection', function (socket) {
	antiSpam.onConnect(socket); // Add this line in your on connection event
});
````
_Now all sockets will be individually checked if they spam your socket.emits and if they do they will be disconnected, after to many repeated offenses they will be temp banned (ip based)._
___
# Contact  
You can contact me at specamps@gmail.com