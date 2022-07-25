const chalk = require('chalk')
const readGPU = require('./helper/readMuonCPU')
const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')
const Hyperbee = require('hyperbee')

sensorServerNode1()

async function sensorServerNode1() {
    const swarm = new Hyperswarm()
    const core = new Hypercore('./sensor-Server-Node-1')
    const bee = new Hyperbee(core, {keyEncoding: "utf-8", valueEncoding: "utf-8"} )
    await core.ready()

    console.log(chalk.red('Server-Public-Key: ' + core.key.toString('hex')))

    for (var i = 0; i < 5; i++) {
        const returnValues = await readGPU()
        // dateTime = returnValues.date
        // temprature = returnValues.temp
        await bee.put(returnValues.date, returnValues.temp)
        console.log("PUT Date: " + returnValues.date + " and " + returnValues.temp)
        // After the append, we can see that the length has updated.
        console.log('Length of the first core:', core.length)
        await sleep(5000)
      }

    swarm.on('connection', (socket, peerInfo) => {
        core.replicate(socket)
    })
    swarm.join(core.discoveryKey, { server: true, client: false })
    swarm.flush()
}

async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }