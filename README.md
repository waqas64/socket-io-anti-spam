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


___
# How it works
All connected sockets will have a object binded to them full of information that socket-anti-spam keeps track of.   
This includes how much 'spamScore' someone has. If a socket is doing a socket.emit his spamScore will increase.   
The module will give all sockets connected a -1 spamScore every second.  
if the spamScore is above a certain spamScore threshold the socket will be disconnected.   
If the socket keeps spamming after a certain kick threshold, the socket will be temp ip banned.



[You can see a demo of the module in action here, please remember that this is from previous versions and the appearances might look different](https://bitbucket.org/repo/kR4677/images/1013607973-socketspam.gif)
___
# Important!!!!
__Version 1.0.0 is released, it is a complete rewrite of the module. Please check the documentation!__

___
# Changelog


[https://github.com/michaeldegroot/socket-anti-spam/commits/master](https://github.com/michaeldegroot/socket-anti-spam/commits/master)
___
#  Getting started

##### 1. Start by installing the package:
    npm install socket-anti-spam

##### 2. Load the code
```javascript
var antiSpam = require('socket-anti-spam');
antiSpam.init({
    banTime: 30,            // Ban time in minutes
    kickThreshold: 2,       // User gets kicked after this many spam score
    kickTimesBeforeBan: 1   // User gets banned after this many kicks
});

io.sockets.on('connection', function (socket) {
    
     // Add this line after your on connection event
    antiSpam.onConnect(socket, function(err,data){
        if(err) console.log(err);
        console.log(data) // returns antiSpam user object, useful for more information
    });
    
    // The rest of your code
});
````
_Now all sockets will be individually checked if they spam your socket.emits and if they do they will be disconnected, after to many repeated offenses they will be temp banned (ip based)._
___
## API

###  .onConnect(socket, callback)
```js
socket:     Object      // The user socket variable
callback:   Function    // Returns err, data
```
_This is called after the on connection event for your sockets_  
__IMPORTANT__: _You have to use .onConnect or the module will __FAIL___

__Example__

````js
var io = require('socket.io');
var antiSpam = require('socket-anti-spam');

io.sockets.on('connection', function (socket) {
    antiSpam.onConnect(socket, function(err,data){
        if(err) console.log(err);
    });
});
````

###  .getBans()
_Returns a array full of ip's that are currently banned_  

__Example__

````js
var antiSpam = require('socket-anti-spam');

var bans = antiSpam.getBans();
console.log(bans)   // Returns a array full of ip's that are currently banned
````
###  .ban(data,minutes)
```js
data:       Object / String     //  Can be either socket.ip or a ip in string format you want to ban
minutes:    Number              // Number in minutes how long the ban will be active, if not supplied default will be used (60)
```
_Simply bans a socket or ip_  

__Example__ banning a ip in string format

````js
var antiSpam = require('socket-anti-spam');

antiSpam.ban("127.0.0.1") // Bye!
````

__Example__ banning a socket, and set ban time for 5 minutes

````js
var antiSpam = require('socket-anti-spam');

io.sockets.on('connection', function (socket) {
    antiSpam.ban(socket, 5);
});
````
###  .unBan(data)
```js
data:   Object / String    //  Can be either socket.ip or a ip in string format you want to unban
```
_Simply unbans a socket or ip_  

__Example__ unbanning a ip in string format

````js
var antiSpam = require('socket-anti-spam');

antiSpam.unban("127.0.0.1") // He's back!
````

__Example__ unbanning a socket

````js
var antiSpam = require('socket-anti-spam');

io.sockets.on('connection', function (socket) {
    antiSpam.unBan(socket);
});
````

___
# Contact  
You can contact me at specamps@gmail.com