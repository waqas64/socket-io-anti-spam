var assert = require('assert');
var assert = require('assert-plus');
var clientIo = require('socket.io-client');
var io = require('socket.io').listen(3000,{ log: false });
var antiSpam = require('../antispam');

var passed = false;
var passedBan = false;
var disconnected = false;
var times = 0;
clientSocket = clientIo.connect('http://127.0.0.1:3000',{'forceNew':true });

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
	if(disconnected){
		times++;
		if(times>=4){
			disconnected = true;
			return;
		}
		console.log("RECONNEECT");
		clientSocket = clientIo.connect('http://127.0.0.1:3000',{'forceNew':true });
		clientSocket.on("connect", function(){
			console.log("ON CONNECT!");
			disconnected = false;
		});
		clientSocket.on("reconnect", function(){
			console.log("ON RECONNECT!");
			disconnected = false;
		});
		clientSocket.on("disconnect", function(){
			console.log("ON DISCONNECT!");
			disconnected = true;
		});
		disconnected = false;
		return;
	}
	clientSocket.emit('spamming', { some: 'data' });
	setTimeout(function(){ repeat(); },250);
}
clientSocket.on("connect", function(){
	console.log("ON CONNECT!");
	disconnected = false;
});
clientSocket.on("reconnect", function(){
	console.log("ON RECONNECT!");
	disconnected = false;
});
clientSocket.on("disconnect", function(){
	console.log("ON DISCONNECT!");
	disconnected = true;
});

io.sockets.on('connection', function (socket) {
	antiSpam.onConnect(socket);
	socket.on("spamming", function() {
		socket.emit("spamscore", antiSpam.getSpamScore(socket));
	});
});

describe("Internal", function(){
	this.timeout(5000);
	var passedInt;
	var passedInt2;
	it('Connect to the webserver, spam socket.emits and get disconnect/kicked', function(done){
		var spammerino = setInterval(function(){
			repeat();
			if(!disconnected) return;
			clearInterval(spammerino);
			done();
		},100);
	});
	it('Again :)', function(done){
		var spammerino = setInterval(function(){
			repeat();
			if(!disconnected) return;
			clearInterval(spammerino);
			done();
		},100);
	});
	it('Remove kickcount', function(){
		assert.doesNotThrow(function(){
			antiSpam.removeKickCount();
		});
	});
});

