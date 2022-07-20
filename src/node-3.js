const Hyperswarm = require('hyperswarm')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const Hypercore = require('hypercore')
const chalk = require('chalk')
const node3Loggo = 'LOGGO FROM NODE-3: '

const sharedPublicKey = Buffer.alloc(32).fill('2eaec82cb1f9f420fa1adee6f62cbec824c90debd945b6eea2f1ab10300abf5b')

/**IMPEMENTIERUNG DER NODES: Nodes 3
 * 
 * 
*/


/**Wie wird die query implementiert? erst DB runterladen und dann query oder querie schicken 
 * wie sendet man queries durch ein Hypercore Netzwerk
 * unterschied zwischen join-on-topic und join-on-key?
 * 
 * NEXT Daten aus Sensor-Server-Node-1 lesen!!
 * woran liegt es? 
 * wird der db der falsch key übergeben?
 * funktioniert die Methode zum auslesen der DB nicht?
 * Oder ist gar dei DB im Netztwerk nicht verfügbar - s. video "replicate"? 
 * KEY Chaos: welches ist der richtige Public-Key? wie teilen zwei Nodes den gleichen Key?
*/
core3()

async function core3() {

  try {
    const storeNode3 = new Corestore('./Node-3')
    const core = storeNode3.get(sharedPublicKey)
    const swarmClient = new Hyperswarm()

    // It accepts LevelDB-style key/value encoding options.
    const db = new Hyperbee(core, {
      keyEncoding: 'utf-8',
      valueEncoding: 'utf-8'
    })
    await db.ready()

    console.log(node3Loggo + "\nCore Key: " + core.key.toString('hex'))


    /**JOIN-ON-TOPIC */
    swarmClient.on('connection', (socket, peerInfo) => {
      core.replicate(socket)
      socket.on('data', data => console.log('\n\nclient got message:', data.toString()))

      // console.log(node3Loggo + "\npeerInfo.publicKey: " + peerInfo.publicKey.toString('hex')
      //   + "\npeerInfo.topics: " + peerInfo.topics.toString('hex'))

      // console.log('\nswarm got a client connection:', "\nremotePublicKey: ", conn.remotePublicKey.toString('hex'),
      //   "\npublicKey: ", conn.publicKey.toString('hex'), "\nhandshakeHash: ", conn.handshakeHash.toString('hex'))
      // console.log('A Map containing all connected peers:', swarmClient.peers)

      socket.write('\nhello from client-node3, can is send queries over this chennel?')
    })

    const topic = Buffer.alloc(32).fill('sensor data') // A topic must be 32 bytes   
    swarmClient.join(topic, { server: false, client: true })
    await swarmClient.flush() // Waits for the swarm to connect to pending peers.
    // After this point, both client and server should have connections


    // /**JOIN-ON-KEY -> Look-up*/
    // swarmClient.on('connection', socket => {
    //   core.replicate(socket)
    //   socket.write('\nhello from client-node3, can is send queries over this chennel?')

    // })
    // swarmClient.join(core.discoveryKey, { server: false, client: true })
    // await swarmClient.flush()

    // After the append, we can see that the length has updated.
    console.log(node3Loggo + 'Length of the first core:', core.length) // Will be 2.

    console.log(chalk.green(node3Loggo + 'Reading KV-pairs with the \'get\' method:\n'))
    for await (const { key, value } of db.createReadStream()) {
      if (key = null) {
        console.log('DB empty')
      } else {
        console.log(`${key} -> ${value}`)
      }
    }

    await core.close()

  } catch (error) {
    console.error('Error in creating Hypercore', error)
  }
}