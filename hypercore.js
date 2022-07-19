const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const soloCoreLoggo = 'LOGGO FROM SOLO-CORE-APP: '
const Hyperswarm = require('hyperswarm')
const Hyperbee = require('hyperbee')
//const remoteKey = ''


/**IMPEMENTIERUNG DER NODES: Nodes 3- x 
 * 
 * 
*/


/**Wie wird die query implementiert? erst DB runterladen und dann query oder querie schicken 
 * wie sendet man queries durch ein Hypercore Netzwerk
 * unterschied zwischen join-on-topic und join-on-key?
 * 
 * NEXT mit KEY DB finden und con Client daten abfragen....
*/

coreX()

async function coreX() {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green(soloCoreLoggo + 'Step 1: Create the initial Hypercore\n'))


  try {
    /**Creating Hypercore Instance */
    const core = new Hypercore('./node-x', this.key, { createIfMissing: true, valueEncoding: 'utf-8' })
    const swarmClient = new Hyperswarm()

    /**Loading remote Hypercore */
    const remoteCore = new Hypercore(remoteKey)

    // It accepts LevelDB-style key/value encoding options.
    const db = new Hyperbee( remoteCore, {
      keyEncoding: 'utf-8',
      valueEncoding: 'utf-8'
    })
    await db.ready()
    await core.ready()

    console.log(soloCoreLoggo + "\nCore Key: " + core.key.toString("base64") + "\nCore-Key-Pair: " + core.keyPair.publicKey.toString("base64"))

    swarmClient.on('connection', (conn, peerInfo) => {
      conn.on('data', data => console.log('\n\nclient got message:', data.toString()))
      console.log(soloCoreLoggo + "\npeerInfo.publicKey: " + peerInfo.publicKey.toString("base64") + "\npeerInfo.topics: " + peerInfo.topics.toString("base64"))
      console.log('\nswarm got a client connection:', connection.remotePublicKey, connection.publicKey, connection.handshakeHash)
      conn.write('\nhello from client-node3, can is send queries over this chennel?')
    })

    const topic = Buffer.alloc(32).fill('sensor data') // A topic must be 32 bytes   
    swarmClient.join(topic, { server: false, client: true })
    await swarmClient.flush() // Waits for the swarm to connect to pending peers.
    // After this point, both client and server should have connections

    // After the append, we can see that the length has updated.
    console.log(soloCoreLoggo + 'Length of the first core:', core.length) // Will be 2.

    // The createReadStream method accepts LevelDB-style gt, lt, gte, lte, limit, and reverse options.
    const streams = [['First 10', db.createReadStream({ limit: 10 })] ]

    for (const [name, stream] of streams) {
      console.log(chalk.green('\n' + name + ':\n'))
      for await (const { key, value } of stream) {
        console.log(`${key} -> ${value}`)
      }
    }

    await core.close()

  } catch (error) {
    console.error('Error in creating Hypercore', error)
  }
}