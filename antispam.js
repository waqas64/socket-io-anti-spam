const moment = require('moment')
const events = require('events')
const debug = require('debug')('socketantispam')
const debugHeartbeats = require('debug')('socketantispam:heartbeats')

class SocketAntiSpam {
  constructor(sets) {
    debug('Initializing')
    this.defaultOptions = {
      banTime: 60,
      kickThreshold: 10,
      kickTimesBeforeBan: 3,
      banning: true,
      heartBeatStale: 40,
      heartBeatCheck: 4,
    }

    this.users = {}
    this.heartbeats = {}
    this.options = this.defaultOptions
    this.event = new events.EventEmitter()

    if (this.not(sets.banTime))
      sets.banTime = this.defaultOptions.banTime
    if (this.not(sets.kickThreshold))
      sets.kickThreshold = this.defaultOptions.kickThreshold
    if (this.not(sets.kickTimesBeforeBan))
      sets.kickTimesBeforeBan = this.defaultOptions.kickTimesBeforeBan
    if (this.not(sets.banning))
      sets.banning = this.defaultOptions.banning
    if (this.not(sets.heartBeatStale))
      sets.heartBeatStale = this.defaultOptions.heartBeatStale
    if (this.not(sets.heartBeatCheck))
      sets.heartBeatCheck = this.defaultOptions.heartBeatCheck
    if (sets.io) {
      debug('Socket-io variable given, binding to onevent\'s')
      sets.io.on('connection', (socket) => {
        const _onevent = socket.onevent
        socket.onevent = packet => {
          const args = packet.data || []
          this.addSpam(socket).then(() => {
            _onevent.call(socket, packet)
          }).catch(e => {
            throw new Error(e)
          })
        }

        this.authenticate(socket)

        socket.on('disconnect', () => {
          this.clearHeart(socket)
        })
      })
    }

    this.options = sets
  }

  not(val) {
    return (val == null || val === false || val == undefined)
  }

  clearHeart(socket) {
    if (!this.heartbeats[socket.id]) {
      return
    }

    debugHeartbeats('Clearing heartbeat', socket.id)
    clearInterval(this.heartbeats[socket.id].interval)
    delete this.heartbeats[socket.id]
  }

  addHeart(socket) {
    if (this.heartbeats[socket.id]) {
      return
    }

    debugHeartbeats('Adding heartbeat', socket.id)
    this.clearHeart(socket)
    this.heartbeats[socket.id] = {
      interval: setInterval(socket => {
        this.checkHeart(socket)
      }, this.options.heartBeatCheck * 1000, socket),
    }
  }

  checkHeart(socket) {
    if (!this.heartbeats[socket.id]) {
      return (this.clearHeart(socket))
    }

    debugHeartbeats('Checking heartbeat', socket.id)
    const startedSince = Math.round(this.heartbeats[socket.id].interval._idleStart / 1000)
    if (startedSince >= this.options.heartBeatStale) {
      this.clearHeart(socket)
    }

    this.authenticate(socket)
  }

  authenticate(socket) {
    debug('Authenticating socket', socket.id)
    return new Promise((resolve, reject) => {
      try {
        if (this.not(socket.ip)) {
          socket.ip = socket.client.request.headers['x-forwarded-for'] || socket.client.conn.remoteAddress
        }

        this.event.emit('authenticate', socket)
        if (typeof(this.users[socket.ip]) == 'undefined') {
          this.users[socket.ip] = {
            score:           0,
            banned:          false,
            kickCount:       0,
            bannedUntil:     0,
            lastInteraction: moment(),
            lastLowerKick:   moment(),
          }
        }

        const data = this.users[socket.ip]
        if (data.banned) {
          data.banned = false
          if (this.heartbeats[socket.id]) {
            this.clearHeart(socket)
          }

          if (data.bannedUntil.diff(moment(), 'seconds') >= 1) {
            data.banned = true
            socket.banned = true
            debug('Banned socket on authentication', socket.id, 'for', data.bannedUntil.diff(moment(), 'seconds'), 'seconds')
            socket.disconnect()
          }
        }

        this.addHeart(socket)
        return resolve(data)
      } catch (e) {
        return reject(e)
      }
    })
  }

  addSpam(socket) {
    debug('Adding spamscore to', socket.id)
    return new Promise((resolve, reject) => {
      if (this.not(socket)) {
        return reject(new Error('socket variable is not defined'))
      }

      this.authenticate(socket).then(data => {
        if (data.banned) {
          return reject(new Error('socket is banned'))
        }

        const lastInteraction = moment.duration(moment().diff(data.lastInteraction)).asSeconds()
        data.lastInteraction = moment()

        if (lastInteraction < 1) {
          data.score++
        }

        if (lastInteraction >= 1) {
          const newScore = data.score - Math.round(lastInteraction)
          data.score = newScore
          if (newScore <= 0) {
            data.score = 0
          }
        }

        const lastLowerKick = moment.duration(moment().diff(data.lastLowerKick)).asSeconds()
        if (lastLowerKick >= 1800 && data.kickCount >= 1) {
          data.lastLowerKick = moment()
          data.kickCount--
        }

        this.event.emit('spamscore', socket, data)
        if (data.score >= this.options.kickThreshold) {
          this.event.emit('kick', socket, data)
          data.score = 0
          data.kickCount = data.kickCount + 1
          if (data.kickCount >= this.options.kickTimesBeforeBan && this.options.banning) {
            this.event.emit('ban', socket, data)
            this.clearHeart(socket)
            data.kickCount = 0
            data.banned = true
            data.lastLowerKick = moment()
            data.bannedUntil = moment().add(this.options.banTime, 'minutes')
          }

          socket.disconnect()
        }

        debug('Current spamscore of', socket.id, 'is', data.score)
        return resolve(data)
      }).catch(e => {
        return reject(e)
      })
    })
  }

  ban(data, min) {
    debug('Banning', data, min)
    if (this.not(data)) {
      throw new Error('No options defined')
    }

    if (this.not(min)) {
      min = this.options.banTime
    }

    let ip = false
    if (typeof(this.users[data]) !='undefined') {
      ip = data
    }

    if (typeof(this.users[data.ip]) != 'undefined') {
      ip = data.ip
    }

    if (ip) {
      return this.banUser(true, ip)
    }

    return false
  }

  unBan(data) {
    debug('Unbanning', data)
    if (this.not(data)) {
      throw new Error('No options defined')
    }

    let ip = false
    if (typeof(this.users[data]) != 'undefined') {
      ip = data
    }

    if (typeof(this.users[data.ip]) != 'undefined') {
      ip = data.ip
    }

    if (ip) {
      return this.banUser(false, ip)
    }

    return false
  }

  banUser(ban, data, min) {
    debug('banUser', ban, data, min)
    this.users[data].kickCount = 0
    this.users[data].score = 0
    if (ban) {
      this.users[data].banned = true
      this.users[data].lastLowerKick = moment()
      this.users[data].bannedUntil = moment().add(min, 'minutes')
    } else {
      this.users[data].banned = false
      this.users[data].lastLowerKick = moment()
      this.users[data].bannedUntil = 0
    }

    return true
  }

  getBans() {
    const banned = []
    for (let user in this.users) {
      if (this.users[user].banned)
        banned.push({
          ip:    user,
          until: this.users[user].bannedUntil,
        })
    }

    return banned
  }
}

module.exports = SocketAntiSpam
