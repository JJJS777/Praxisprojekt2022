'use strict' //benötigt?

const hypercore = require('./hypercore');
const corestore = require('./corestore');
const swarmServer = require('./hyperswarmSever')
const swarmClient = require('./hyperswarmClient')

corestore()
swarmServer()
swarmClient()



