const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const soloCoreLoggo = 'LOGGO FROM SOLO-CORE-APP: '
const Hyperswarm = require('hyperswarm')


/**IMPEMENTIERUNG DER NODES: Nodes 3- x 
 * 
 * 
*/

coreX()

async function coreX() {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green(soloCoreLoggo + 'Step 1: Create the initial Hypercore\n'))


  try {
    /**Creating Hypercore Instance */
    const core = new Hypercore('./my-hypercore', this.key, { createIfMissing: true, valueEncoding: 'json' })
    const swarmClient = new Hyperswarm()

    console.log(soloCoreLoggo + core.key + core.keyPair)


    swarmClient.on('connection', (conn, peerInfo) => {
      conn.on('data', data => console.log('client got message:', data.toString()))
      console.log(soloCoreLoggo + peerInfo.publicKey + peerInfo.topics)
      conn.write('hello from client-node3, can is send queries over this chennel?')
    })

    const topic = Buffer.alloc(32).fill('sensor data') // A topic must be 32 bytes   
    swarmClient.join(topic, { server: false, client: true })
    await swarmClient.flush() // Waits for the swarm to connect to pending peers.

    // After this point, both client and server should have connections

    // After the append, we can see that the length has updated.
    console.log(soloCoreLoggo + 'Length of the first core:', core.length) // Will be 2.

    await core.close()

  } catch (error) {
    console.error('Error in creating Hypercore', error)
  }
}