const chalk = require('chalk')
const Hyperbee = require('hyperbee')
const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')
const readCPU = require('./helper/readMuonCPU');
const beeLoggo = 'LOGGO FROM BEE-CORE: '
const sharedPublicKey = Buffer.alloc(32).fill('2eaec82cb1f9f420fa1adee6f62cbec824c90debd945b6eea2f1ab10300abf5b')


/**IMPEMENTIERUNG DER NODES: Sensor-Server-Node-1
 * 
 * 
 * 
*/

start()

async function start() {
  // A Hyperbee is stored as an embedded index within a single Hypercore.

  const store = new Corestore('./Sensor-Server-Node-1')
  await store.ready()
  const core = store.get({key: sharedPublicKey})
  await core.ready()

  const swarmServer = new Hyperswarm()

  // It accepts LevelDB-style key/value encoding options.
  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()

  console.log(beeLoggo + "\nKEY: " + core.key.toString('hex') + "\ndiscoveryKey: " + core.discoveryKey.toString('hex'))

  /**JOIN-ON-TOPIC */
  swarmServer.on('connection', (socket, peerInfo) => {
    core.replicate(socket)
    //socket.write('\n\n****this is a server connection*****')

    // console.log(beeLoggo + "\npeerInfo.publicKey: " + peerInfo.publicKey.toString('hex') + "\npeerInfo.topics: "
    //   + peerInfo.topics.toString('hex'))

    // console.log('\nswarm got a server connection:', "\nremotePublicKey: ", socket.remotePublicKey.toString('hex'),
    //   "\npublicKey: ", socket.publicKey.toString('hex'), "\nhandshakeHash: ", socket.handshakeHash.toString('hex'))

    //console.log('A Map containing all connected peers:', swarmServer.peers)

    socket.on('data', data => console.log('server got message:', data.toString()))
    socket.on('error', err => console.error('1 CONN ERR:', err))
  })


  const topic = Buffer.alloc(32).fill('sensor data') // A topic must be 32 bytes
  const discoveryOnTopic = swarmServer.join(topic, { server: true, client: false })
  await discoveryOnTopic.flushed() // Waits for the topic to be fully announced on the DHT
  await swarmServer.flush()


  // /**JOIN-ON-KEY -> announce*/
  // swarmServer.on('connection', socket => {
  //   core.replicate(socket)
  //   socket.on('data', data => console.log('server got message:', data.toString()))
  //   socket.on('error', err => console.error('1 CONN ERR:', err))
  // })

  // const discoveryOnKey = swarmServer.join(core.discoveryKey, { server: true, client: false })
  // await swarmServer.flush()
  // await discoveryOnKey.flushed()

  for (var i = 0; i < 2; i++) {
    const returnValues = await readCPU()
    // dateTime = returnValues.date
    // temprature = returnValues.temp
    await db.put(returnValues.date, returnValues.temp)
    console.log(beeLoggo + "PUT Date: " + returnValues.date + " and " + returnValues.temp)
    // After the append, we can see that the length has updated.
    console.log(beeLoggo + 'Length of the first core:', core.length)
    await sleep(5000)
  }

  /**TESTING START */
  // createReadStream can be used to yield KV-pairs in sorted order.
  // createReadStream returns a ReadableStream that supports async iteration.

  // console.log(chalk.green(beeLoggo + 'Reading KV-pairs with the \'get\' method:\n'))
  // for await (const { key, value } of db.createReadStream()) {
  //   console.log(`${key} -> ${value}`)
  // }
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}