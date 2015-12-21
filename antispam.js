'use strict'

var moment = require('moment')
var not = require('nott')
var defaultOptions = {
  banTime: 60,
  kickThreshold: 10,
  kickTimesBeforeBan: 3
}
var options = defaultOptions

var users = {}
var heartbeats = {}
exports.init = function(sets) {
  if(not(sets.banTime)) sets.banTime = defaultOptions.banTime
  if(not(sets.kickThreshold)) sets.kickThreshold = defaultOptions.kickThreshold
  if(not(sets.kickTimesBeforeBan)) sets.kickTimesBeforeBan = defaultOptions.kickTimesBeforeBan
  options = sets
}

exports.onConnect = function(socket,cb){
  if(not(cb)) throw new Error("No callback defined")
  
  var emit = socket.emit
  socket.emit = function() {
    exports.addSpam(socket)
    emit.apply(socket, arguments)
  }
  addHeart(socket, function(){
    authenticate(socket, cb)
  })
}

exports.addSpam = function(socket){
  if(not(socket)) throw new Error("socket variable is not defined");
  authenticate(socket, function(err,data){
    if(err) throw new Error(err)
    if(data.banned) return
    
    if(data.score>=options.kickThreshold){
      data.score = 0
      data.kickCount = data.kickCount + 1
      if(data.kickCount>=options.kickTimesBeforeBan){
        clearInterval(heartbeats[socket.id].interval)
        data.kickCount = 0
        data.banned = true
        data.bannedUntil = moment().add(options.banTime, 'minutes')
      }
      socket.disconnect()
    }
    data.score++
  })
}

function addHeart(socket,cb){
  if(not(cb)) throw new Error("No callback defined")
  if(heartbeats[socket.id]) clearInterval(heartbeats[socket.id].interval)
  heartbeats[socket.id] = {
    interval: setInterval(checkHeart,2000,socket)
  }
  cb(null)
}

function checkHeart(socket){
  var startedSince = Math.round(heartbeats[socket.id].interval._idleStart/1000)
  if(startedSince>=60) clearInterval(heartbeats[socket.id].interval)
  if(users[socket.ip]){
    if(users[socket.ip].banned){
      socket.disconnect()
      clearInterval(heartbeats[socket.id].interval)
    }
  }
}

function authenticate(socket, cb){
  exists(socket, function(err,data){
    if(err) return(cb(err,null))
    if(data.banned){
      clearInterval(heartbeats[socket.id].interval)
      if(data.bannedUntil.diff(moment(), 'seconds')<=0){
        data.banned = false
      }else{
        socket.disconnect()
      }
    }
    cb(null,data)
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

exports.ban = function(data,min){
  if(not(min)) min = options.banTime;
  var ip = false
  if(typeof(users[data])!="undefined") ip = data
  if(typeof(users[data.ip])!="undefined") ip = data.ip
  if(ip) return ban(true,ip)
  return false;
}

exports.unBan = function(data){
  var ip = false
  if(typeof(users[data])!="undefined") ip = data
  if(typeof(users[data.ip])!="undefined") ip = data.ip
  if(ip) return ban(false,ip)
  return false
}

function ban(ban,data,min){
  users[data].kickCount = 0
  users[data].score = 0
  if(ban){
    users[data].banned = true
    users[data].bannedUntil = moment().add(min, 'minutes')
  }else{
    users[data].banned = false
    users[data].bannedUntil = 0
  }
  return true
}

exports.getBans = function(){
  var banned = []
  var user
  for(user in users){
    if(users[user].banned) banned.push({ip:user,until:users[user].bannedUntil})
  }
  return banned;
}

exports.lowerScore = function(){
  var user
  for(user in users){
    if(users[user].score>=1) users[user].score = users[user].score - 1;
  }
  return true
}

exports.lowerKickCount = function(){
  var user
  for(user in users){
    if(users[user].kickCount>=1) users[user].kickCount = users[user].kickCount - 1
  }
  return true
}

setInterval(exports.lowerScore,1000)
setInterval(exports.lowerKickCount,1800000)

exports.antiSpam = exports