'use strict' //benötigt?

const hypercore = require('./hypercore');
const corestore = require('./corestore');
const swarmServer = require('./hyperswarmSever');
const swarmClient = require('./hyperswarmClient');
const readCPU = require('./readMuonCPU');

const tmp = async () => {
    try {
        const values = await readCPU()
        console.log(values.date, values.temp)
    } catch (error) {
        console.error(error)
    }
}

tmp()



