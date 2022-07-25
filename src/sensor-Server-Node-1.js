const chalk = require('chalk')
const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')

sensorServerNode1()

async function sensorServerNode1() {
    const swarm = new Hyperswarm()
    const core = new Hypercore('./sensor-Server-Node-1')
    await core.ready()

    console.log(chalk.red('Server-Public-Key: ') + core.key.toString('hex'))

    // Append two new blocks to the core.
    await core.append(['hello', 'world', 'from', 'server'])

    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', core.length)

    swarm.on('connection', (socket, peerInfo) => {
        core.replicate(socket)
    })
    swarm.join(core.discoveryKey, { server: true, client: false })
    swarm.flush()
}