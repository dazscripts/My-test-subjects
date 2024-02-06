const EventEmitter = require('events');


const Logger = require('./logger')
const logger = new Logger

logger.on('messagelogged', (args) => {
    console.log(args)
})

logger.log("chat i logged something")