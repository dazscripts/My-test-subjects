const EventEmitter = require('events')


class Logger extends EventEmitter {
    log(msg){  
        console.log(msg)
        this.emit('messagelogged', {loggedmessage: msg})
    }
}

module.exports = Logger;