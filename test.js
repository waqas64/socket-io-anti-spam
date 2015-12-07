var io = require('socket.io').listen(8080,{ log: false });
var clientIo = require('socket.io-client');

var antiSpam = require('./antispam');
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

var socket = clientIo.connect('http://localhost:8080');
var less = 1;
disconnected = false;

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
	console.log("TEST PASSED");
	process.exit();
},2000);
function repeat(){
	if(disconnected) return;
	socket.emit('spamming', { some: 'data' });
	setTimeout(function(){ repeat(); },10);
}

