const { once } = require("events");
const Hypercore = require('hypercore')


module.exports = async function remoteSensor(nodeIndex, remotePublicKey) {
    //**Init Hypercore with RPK */
    const sensorCore = new Hypercore('../data/nodes/node-' + nodeIndex, Buffer.from(remotePublicKey, "hex"), { sparse: true })
    try {
        await sensorCore.ready()
        console.log('Remote Core with Public Key: ' + sensorCore.key.toString('hex') + ' has been Initialized')
        console.log('Local Core is writeable: ' + sensorCore.writable)
        console.log('Local Core is readable: ' + sensorCore.readable)
    } catch (error) {
        console.error(error)
    }

    return sensorCore
}