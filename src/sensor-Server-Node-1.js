const chalk = require('chalk')
const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')

sensorServerNode1()

async function sensorServerNode1() {
    const swarm = new Hyperswarm()
    const core = new Hypercore('./sensor-Server-Node-1')
    await core.ready()

    console.log('Server-Public-Key: ' + core.key.toString('hex'))

    // Append two new blocks to the core.
    await core.append(['hello', 'world', 'from', 'server'])

    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', core.length)

    swarm.on('connection', (socket, peerInfo) => {
        socket.write(core.key)
    })
    const topic = Buffer.alloc(32).fill('test') // A topic must be 32 bytes
    const discovery = swarm.join(topic, { server: true, client: false })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT
}