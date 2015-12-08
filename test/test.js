var assert = require('assert');
var assert = require('assert-plus');
var clientIo = require('socket.io-client');
var io = require('socket.io').listen(3000,{ log: false });
var clientIo = require('socket.io-client');
var antiSpam = require('../antispam');

var passed = false;
var passedBan = false;
var disconnected = false;

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

io.sockets.on('connection', function (socket) {
	antiSpam.onConnect(socket);
	socket.on("spamming", function() {
		socket.emit("spamscore", antiSpam.getSpamScore(socket));
	});
});


describe("Socket.io", function(){
	it('Connect', function(done){
		socket = clientIo.connect('http://localhost:3000');
		io.sockets.on('connection', function (socket) {
			clientSocket = socket;
			done();
		});
	});
});

describe("Internal", function(){
	this.timeout(60000);
	var passedInt;
	it('Connect to the webserver, spam socket.emits and get disconnect/kicked', function(done){
		var socket = clientIo.connect('http://localhost:3000');
		socket.on("connect", function(){
			repeat();
		});
		socket.on("disconnect", function(){
			disconnected = true;
		});
		socket.on("spamscore", function(score){
		});
		setInterval(function(){
			if(!disconnected) return;
			if(passed == true) passedBan = true;
			passed = true;
		},10);
		function repeat(){
			if(disconnected) return;
			socket.emit('spamming', { some: 'data' });
			setTimeout(function(){ repeat(); },250);
		}
		passedInt = setInterval(function(){
			if(passed == true){
				clearInterval(passedInt);
				done();
			}
		},10);
	});
});

