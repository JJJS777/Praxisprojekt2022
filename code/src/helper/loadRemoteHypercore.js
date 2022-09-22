const { once } = require("events");
const initHyperbee = require('./initHyperbee')
const topic = Buffer.alloc(32).fill('sensor network') // A topic must be 32 bytes


module.exports = async function remoteSensor(coreStore, remotePublicKey, swarm) {
    //**Init Hypercore with RPK */
    const sensorCore = coreStore.get(Buffer.from(remotePublicKey, "hex"))
    try {
        await sensorCore.ready()
        console.log('Remote Core with Public Key: ' + sensorCore.key.toString('hex') + ' has been Initialized')
        console.log('Local Core is writeable: ' + sensorCore.writable)
        console.log('Local Core is readable: ' + sensorCore.readable)
    } catch (error) {
        console.error(error)
    }

    //**Connecting to Hyperswam */
    // Start swarming the hypercore.
    swarm.join(topic, {
        announce: true,
        lookup: true
    })

    //**Init and Query DB */
    const bee = await initHyperbee(sensorCore)

    // Ensure we are connected to at least 1 peer (else getting simply returns null)
    if (bee.feed.writable || bee.feed.peers.length) {
        console.log("Writable or already found peers for core");
    } else {
        console.log("Waiting for peers to connect");
        const [peer] = await once(bee.feed, "peer-add");
        // console.log('peer-objekt:')
        // console.log(peer)
        // console.log("Connected to peer", peer.remotePublicKey.toString('hex'));
    }

    const readStream = await bee.createReadStream({ live: false, limit: 5 })
    for await (const entry of readStream) {
        console.log(entry)
    }
}