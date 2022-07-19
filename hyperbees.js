const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const Hyperbee = require('hyperbee')
const readCPU = require('./readMuonCPU');
const beeLoggo = 'LOGGO FROM BEE-CORE: '
const Hyperswarm = require('hyperswarm')
const net = require('net')


/**IMPEMENTIERUNG DER NODES: Sensor-Server-Node-1 und 2 
 * 
 * 
 * 
*/

start()

async function start() {
  // A Hyperbee is stored as an embedded index within a single Hypercore.
  const core = new Hypercore(ram)
  const swarmServer = new Hyperswarm()

  await core.ready()
  console.log( beeLoggo + " KEY: " + core.key.toString("base64") + " KEY-Pair: " + core.keyPair.publicKey.toString("base64") + " discoveryKey: " + core.discoveryKey.toString("base64"))

  // It accepts LevelDB-style key/value encoding options.
  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()

  swarmServer.on('connection', (conn, peerInfo) => {
    // swarm1 will receive server connections
    conn.write('this is a server connection')
    console.log(beeLoggo + "peerInfo.publicKey: " + peerInfo.publicKey.toString("base64") + "peerInfo.topics: " + peerInfo.topics.toString("base64"))
    conn.on('data', data => console.log('server got message:', data.toString()))
    conn.end()
  })

  const topic = Buffer.alloc(32).fill('sensor data') // A topic must be 32 bytes
  const discovery = swarmServer.join(topic, { server: true, client: false })
  await discovery.flushed() // Waits for the topic to be fully announced on the DHT
  // After this point, both client and server should have connections

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

  core.replicate( false )
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}