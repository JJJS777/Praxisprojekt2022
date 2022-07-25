const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')
const chalk = require('chalk')


node3()

async function node3() {
    var remotePublicKey = '6d358152d1964f725b19e406c9a2a0e22b207b4861ca2c50c13649320f9bfb8a'
    const core = new Hypercore('./node-3', Buffer.from(remotePublicKey, 'hex'))
    core.ready
    console.log(chalk.green('Local-public-key: ') + core.key.toString('hex'))

    const swarm = new Hyperswarm()
    swarm.on('connection', (socket, peerInfo) => {
        core.replicate(socket)
    })

    swarm.join(core.discoveryKey, { server: false, client: true })
    console.log('Requesting core:', core.key.toString('hex'))
    await swarm.flush()
}