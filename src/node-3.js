const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')




node3()

async function node3() {
    var remotePublicKey = null
    const swarm = new Hyperswarm()

    swarm.on('connection', (socket, peerInfo) => {
        socket.on('data', data => {
            remotePublicKey = data
            console.log('Remote-public-key: ' + remotePublicKey.key.toString('hex'))
        })
    })

    const topic = Buffer.alloc(32).fill('test') // A topic must be 32 bytes
    swarm.join(topic, { server: false, client: true })
    await swarm.flush() // Waits for the swarm to connect to pending peers.
    // After this point, both client and server should have connections


    const core = new Hypercore('./node3', remotePublicKey, {
        valueEncoding: 'utf-8',
        sparse: true, // When replicating, don't eagerly download all blocks.
    })
    await core.ready()

    console.log('Local-public-key: ' + core.key.toString('hex'))

}