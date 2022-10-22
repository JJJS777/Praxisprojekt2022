module.exports = async function remoteSensor(coreStore, remotePublicKey) {
    //**Init Hypercore with RPK */
    const sensorCore = coreStore.get(Buffer.from(remotePublicKey, "hex"), { sparse: true })
    try {
        await sensorCore.ready()
        console.log(chalk.red('Remote Core with Public Key: ' + sensorCore.key.toString('hex') + ' has been Initialized'))
        console.log('Local Core is writeable: ' + sensorCore.writable)
        console.log('Local Core is readable: ' + sensorCore.readable)
    } catch (error) {
        console.error(error)
    }

    return sensorCore
}