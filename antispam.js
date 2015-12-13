var moment = require('moment')
var not = require('nott')
var options = {
  banTime: 60,
  kickThreshold: 10,
  kickTimesBeforeBan: 3
}

var users = {}

exports.init = function(sets) {
  if(not(sets.banTime)) sets.banTime = 60
  if(not(sets.kickThreshold)) sets.kickThreshold = 10
  if(not(sets.kickTimesBeforeBan)) sets.kickTimesBeforeBan = 3
  options = sets
}

exports.onConnect = function(socket,cb){
  if(not(cb)) throw new Error("No callback defined")
  
  var emit = socket.emit
  socket.emit = function() {
    addSpam(socket)
    emit.apply(socket, arguments)
  }
  authenticate(socket, cb)
}

function addSpam(socket){
  if(not(socket)) throw new Error("socket variable is not defined");
  exists(socket, function(err,data){
    if(err) throw new Error(err)
    if(data.banned) return;
    
    if(data.score>=options.kickThreshold){
      data.score = 0
      data.kickCount = data.kickCount + 1
      if(data.kickCount>=options.kickTimesBeforeBan){
        data.kickCount = 0
        data.banned = true
        data.bannedUntil = moment().add(options.banTime, 'minutes')
      }
      socket.disconnect()
    }
    data.score++
  })
}

function authenticate(socket, cb){
  exists(socket, function(err,data){
    if(err) return(cb(err,null))
    if(data.banned){
      if(data.bannedUntil.diff(moment(), 'seconds')<=0){
        data.banned = false
      }else{
        socket.disconnect()
      }
    }
    cb(null,data);
  })
}

function exists(socket, cb){
  if(not(cb)) throw new Error("No callback defined")
  if(not(socket)) return(cb("socket variable is not defined",null))
  if(not(socket.ip)) socket.ip = socket.client.request.headers['x-forwarded-for'] || socket.client.conn.remoteAddress
  if(typeof(users[socket.ip])!="undefined"){
    cb(null,users[socket.ip])
  }else{
    users[socket.ip] = {
      score: 0,
      banned: false,
      kickCount: 0,
      bannedUntil: 0
    }
    cb(null,users[socket.ip])
  }
}

exports.getBans = function(){
  var banned = [];
  for(user in users){
    if(users[user].banned) banned.push({ip:user,until:users[user].bannedUntil})
  }
  return banned;
}

exports.lowerScore = function(){
  for(user in users){
    if(users[user].score>=1) users[user].score = users[user].score - 1;
  }
  return true;
}

exports.lowerKickCount = function(){
  for(user in users){
    if(users[user].kickCount>=1) users[user].kickCount = users[user].kickCount - 1
  }
  return true;
}

setInterval(exports.lowerScore,1000);
setInterval(exports.lowerKickCount,1800000);

exports.antiSpam = exports