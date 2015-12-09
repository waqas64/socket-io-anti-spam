var assert = require('assert');
var assert = require('assert-plus');
var clientIo = require('socket.io-client');
var io = require('socket.io').listen(3000,{ log: false });
var antiSpam = require('../antispam');

var passed = false;
var passedBan = false;
var disconnected = false;
clientSocket = clientIo.connect('http://127.0.0.1:3000');

var antiSpam = new antiSpam({
	spamCheckInterval: 3000,
	spamMinusPointsPerInterval: 3,
	spamMaxPointsBeforeKick: 12,
	spamEnableTempBan: true,
	spamKicksBeforeTempBan: 3,
	spamTempBanInMinutes: 10,
	removeKickCountAfter: 1,
	debug: true
});

function repeat(){
	if(disconnected) return;
	clientSocket.emit('spamming', { some: 'data' });
	setTimeout(function(){ repeat(); },250);
}
clientSocket.on("connect", function(){
	repeat();
});
clientSocket.on("disconnect", function(){
	disconnected = true;
});
clientSocket.on("spamscore", function(score){
});
setInterval(function(){
	if(!disconnected) return;
	if(passed == true) passedBan = true;
	passed = true;
},10);

io.sockets.on('connection', function (socket) {
	antiSpam.onConnect(socket);
	socket.on("spamming", function() {
		socket.emit("spamscore", antiSpam.getSpamScore(socket));
	});
});

describe("Internal", function(){
	this.timeout(5000);
	var passedInt;
	it('Connect to the webserver, spam socket.emits and get disconnect/kicked', function(done){
		passedInt = setInterval(function(){
			if(passed == true){
				clearInterval(passedInt);
				done();
			}
		},10);
	});
});

