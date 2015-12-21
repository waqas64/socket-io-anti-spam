// This is the test file for socket-anti-spam. Goto 127.0.0.1 and run this to see it live!

// Everyone has this line already when using socket-anti-spam
var io = require('socket.io').listen(8080,{ log: false });

// This is just for the index.html
var static = require('node-static');
var http = require('http');
var file = new static.Server('./public');

// Actually needed for antispam
var antiSpam = require('../antispam');
antiSpam.init({
  banTime: 30,            // Ban time in minutes
	kickThreshold: 2,       // User gets kicked after this many spam score
  kickTimesBeforeBan: 1   // User gets banned after this many kicks
});

// Lets create server for index.html
http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(80);

 // Everyone has this line already when using socket-anti-spam
io.sockets.on('connection', function (socket) {
  console.log(antiSpam.getBans())
  
	// This is actually needed to be added by the user only
	antiSpam.onConnect(socket, function(err,data){
    if(err) console.log(err);
  });
	
	 // Extra socket function for testing purposes so we can spam something :3
	socket.on("spamming", function() {
      socket.emit("spamscore",null);
	});
});