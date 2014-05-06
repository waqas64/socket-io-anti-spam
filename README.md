# What it does

###### Tired of users spamming your socket.io emits? this module prevents this! ######


# How does it look?
	// Everyone has this line already when using socket-anti-spam
	var io = require('socket.io').listen(8080,{ log: false });

	// Needed for socket-anti-spam to work correctly
	var antiSpam = require('./antispam');
	var antiSpam = new antiSpam({
		spamCheckInterval: 3000,
		spamMinusPointsPerInterval: 3,
		spamMaxPointsBeforeKick: 9,
		debug: true
	});

	 // Everyone has this line already when using socket-anti-spam
	io.sockets.on('connection', function (socket) {
		antiSpam.onConnect(socket); // Needed for socket-anti-spam to work correctly
	});

## And now you are safe from people repeatedly spamming your sockets!


#  How do I use it?

## 1. Start by installing the package:
    npm install socket-anti-spam

## 2. Put this in your nodejs server file AFTER you have defined socket.io variable:
	var antiSpam = require('socket-anti-spam');
	var antiSpam = new antiSpam({
		spamCheckInterval: 3000, // define in how much miliseconds the antispam script gives a minus spamscore point
		spamMinusPointsPerInterval: 3, // how many minus spamscore points after x miliseconds?
		spamMaxPointsBeforeKick: 9, // needed points before kick
		debug: false // debug? not needed
	});
	
Now all sockets will be individually checked if they spam your socket.emits and if they do they will be disconnected.

# Contact
    You can contact me at specamps@gmail.com