const chalk = require('chalk')
const Hypercore = require('hypercore')
const Hyperbee = require('hyperbee')
const readCPU = require('./helper/readMuonCPU');
const beeLoggo = 'LOGGO FROM BEE-CORE: '
const Hyperswarm = require('hyperswarm')

/**IMPEMENTIERUNG DER NODES: Sensor-Server-Node-1
 * 
 * 
 * 
*/

start()

async function start() {
  // A Hyperbee is stored as an embedded index within a single Hypercore.
  const core = new Hypercore('./Sensor-Server-Node-1')
  const swarmServer = new Hyperswarm()

  await core.ready()
  console.log(beeLoggo + "\nKEY: " + core.key.toString("base64"), "\nKEY-Pair: " + core.keyPair.publicKey.toString("base64")
    + "\ndiscoveryKey: " + core.discoveryKey.toString("base64"))

  // It accepts LevelDB-style key/value encoding options.
  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()

  swarmServer.on('connection', (conn, peerInfo) => {
    // swarm1 will receive server connections
    conn.write('\n\n****this is a server connection*****')
    console.log(beeLoggo + "\npeerInfo.publicKey: " + peerInfo.publicKey.toString("base64") + "\npeerInfo.topics: "
      + peerInfo.topics.toString("base64"))
    console.log('\nswarm got a server connection:', "\n", conn.remotePublicKey.toString("base64"),
      "\n", conn.publicKey.toString("base64"), "\n", conn.handshakeHash.toString("base64"))
    conn.on('data', data => console.log('server got message:', data.toString()))
    conn.on('error', err => console.error('1 CONN ERR:', err))
    console.log('A Map containing all connected peers:', swarmServer.peers)
    conn.end()
  })

  
  /**JOIN-ON-KEY */
  // const discoveryOnKey = swarmServer.join(publicKey)
  // await discoveryOnKey.flushed()



  /**JOIN-ON-TOPIC */
  const topic = Buffer.alloc(32).fill('sensor data') // A topic must be 32 bytes
  const discoveryOnTopic = swarmServer.join(topic, { server: true, client: false })
  await discoveryOnTopic.flushed() // Waits for the topic to be fully announced on the DHT


  for (var i = 0; i < 5; i++) {
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

  /**TESTING END */

  core.replicate(false)
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}