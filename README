# What it does

###### Tired of users spamming your socket.io emits? this module prevents this! ######


# How does it look?
	var antiSpam = require('./antispam', io);
	var antiSpam = new antiSpam({
		spamCheckInterval: 3000,
		spamMinusPointsPerInterval: 3,
		spamMaxPointsBeforeKick: 9,
		debug: false
	});
	
	io.sockets.on('connection', function (socket) {
		antiSpam.onConnect(socket);
		
		.......
	});

## And now you are safe from people repeatedly spamming your sockets!


#  How do I use it?

## 1. Start by installing the package:
    npm install socket-anti-spam

## 2. Put this in your nodejs server file AFTER you have defined socket.io variable:
	var antiSpam = require('socket-anti-spam', io);
	
Now all sockets will be individually checked if they spam your socket.emits and if they do they will be disconnected.

# Contact
    You can contact me at specamps@gmail.com