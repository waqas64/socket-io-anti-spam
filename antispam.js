(function() {
	Debug = false;
	spamData = new Object();
	antiSpam = 3000;
	antiSpamRemove = 3;
	maxSpam = 9;
	
	var antiSpam = function(set) {
		antiSpam = set["spamCheckInterval"];
		antiSpamRemove = set["spamMinusPointsPerInterval"];
		maxSpam = set["spamMaxPointsBeforeKick"];
		Debug = set["debug"];
	}

	antiSpam.prototype.addSpam = function(socket){
		if(socket.spamViolated) return;
		spamData[socket.id].spamScore+=1;
		this.maxSpamCheck(socket);
	}
	
	antiSpam.prototype.getSpamScore = function(socket){
		if(spamData[socket.id]!=undefined) return spamData[socket.id].spamScore;
	}
	
	antiSpam.prototype.onConnect = function(socket){
		this.authenticate(socket);
		var dat = this;
		var emit = socket.emit;
		socket.emit = function() {
			dat.addSpam(socket);
			emit.apply(socket, arguments);
		};

		var dat = this;
		var $emit = socket.$emit;
		socket.$emit = function() {
			dat.addSpam(socket);
			$emit.apply(socket, arguments);
		};
		if(typeof(spamCheckInterval)=="undefined") spamCheckInterval = setInterval(this.checkSpam,antiSpam);
	}

	antiSpam.prototype.maxSpamCheck = function(socket){
		if(spamData[socket.id].spamScore>=maxSpam && !socket.spamViolated){
		  socket.spamViolated = true;
		  socket.disconnect();
	   }
	}
	
	antiSpam.prototype.checkSpam = function(){
		for(user in spamData){
			if(spamData[user].spamScore>=1) spamData[user].spamScore-=antiSpamRemove;
		}
		return;
	}
	
	antiSpam.prototype.authenticate = function(socket){
		socket.spamViolated = false;
		spamData[socket.id] = {
			spamScore: 0
		}
	}

	Array.prototype.contains = function(k) {
		for(var p in this)
			if(this[p] === k)
				return true;
		return false;
	};
	module.exports = antiSpam;
}).call(this);