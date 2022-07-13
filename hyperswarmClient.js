//**Using Hyperswarm directly involves some nuances and can be particularly complex when dealing with multiple Hypercores (or multi-core structures like Hyperdrive). Therefore, we recommend using the Corestore Networker module along with Corestore to make life easier.**//
const Hyperswarm = require('hyperswarm')

async function swarmClient() {
    const swarmClient = new Hyperswarm()
    
    swarmClient.on('connection', (conn, info) => {
     conn.on('data', data => console.log('client got message:', data.toString()))
    })
    
    const topic = Buffer.alloc(32).fill('hello world') // A topic must be 32 bytes   
    swarmClient.join(topic, { server: false, client: true })
    await swarmClient.flush() // Waits for the swarm to connect to pending peers.
    
    // After this point, both client and server should have connections
}

module.exports = swarmClient