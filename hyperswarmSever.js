//**Using Hyperswarm directly involves some nuances and can be particularly complex when dealing with multiple Hypercores (or multi-core structures like Hyperdrive). Therefore, we recommend using the Corestore Networker module along with Corestore to make life easier.**//
const Hyperswarm = require('hyperswarm')

async function swarmServer() {
    const swarmServer = new Hyperswarm()

    swarmServer.on('connection', (conn, info) => {
        // swarm1 will receive server connections
        conn.write('this is a server connection')
        conn.end()
    })

    const topic = Buffer.alloc(32).fill('hello world') // A topic must be 32 bytes
    const discovery = swarmServer.join(topic, { server: true, client: false })
    await discovery.flushed() // Waits for the topic to be fully announced on the DHT

    // After this point, both client and server should have connections
}

module.exports = swarmServer