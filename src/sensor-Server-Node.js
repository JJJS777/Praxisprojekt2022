const chalk = require('chalk')
const readGPU = require('./helper/readMuonCPU')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const Networker = require('@corestore/networker')
const { once } = require("events");
const PUBLIC_KEY_SENSOR_NODE_1 = 'a468b9ae1f0ba0bb5f4d69979c65226c5e3516debe422460c104fca219b19bbb' // Node on Muon
const PUBLIC_KEY_SENSOR_NODE_2 = 'a468b9ae1f0ba0bb5f4d69979c65226c5e3516debe422460c104fca219b19bbb' // Node on Pi 


//**Run Node Programm */
sensorNode()

//**Programm Logic */
async function sensorNode(nodeNumber) {
  const localStore = new Corestore('./sensor-Server-Node-' + nodeNumber)
  try {
    await localStore.ready()
  } catch (error) {
    console.error(error)
  }

  const localCore = await localStore.get({ name: 'Local-Sensor-Core' })
  try {
    await localCore.ready()
    //**DEBUG MSG: Local Hypercore is Initialized */
    console.log(chalk.red('Local Hypercore is Initialized: Sensor-Node-Public-Key: ' + localCore.key.toString('hex')))
    console.log('Local Core is writeable: ' + localCore.writable)
    console.log('Local Core is readable: ' + localCore.readable)
    console.log('Local Cores Discovery Key: ' + localCore.discoveryKey.toString('hex'))
  } catch (error) {
    console.error(error)
  }

  const networker = new Networker(localStore)

  localCore.append('Hello')
  localCore.append('from')
  localCore.append('Sensor Node 2')

  try {
    //**Connect to DHT */
    // Start announcing or lookup up a discovery key on the DHT.
    await networker.configure(localCore.discoveryKey, { announce: true, lookup: true, flush: true })

    // Is the networker "swarming" the given core?
    if (networker.joined(localCore.discoveryKey) == true) {
      console.log('Networker swarmed the given Core...')
    } else {
      console.log('Networker faild to swarm the given Core...')
    }

    // Has the networker attempted to connect to all known peers of the core?
    if (networker.flushed(localCore.discoveryKey) == true) {
      console.log('Networker has attempted to connect to all known peers of the core...')
    } else {
      console.log('Networker hasnt attempted to connect to all known peers of the core...')
    }

    networker.on('peer-add', peer => {
      console.log('Node has been added: ' + peer.remotePublicKey)
      console.log('The list of currently-connected peers: ', networker.peers)
    })
  } catch (error) {
    console.error(error)
  }

  const ext = await networker.registerExtension({
    encoding: 'utf-8',
    onmessage(message, peer) {
      // called when a message is received from a peer
      // will be decoded using the encoding you provide
    },
    onerror(err) {
      // called in case of an decoding error
    }
  })

  const message = 'Hello I am Sensor-Node-' + Number

  console.log(message)
  ext.broadcast(message)

}


//**Helper Funktions */
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function initHyperbee(core) {
  const bee = new Hyperbee(core, { keyEncoding: "utf-8", valueEncoding: "utf-8" })
  await bee.ready
  return bee
}

//**Join Network in CLient-Mode to query Data */
async function queryRemoteNode(localStore) {
  //**KLÄREN: Neuen Hyperswarm init oder kann man den bereits init swarm nutzen? */

  /**Init Remote Hypercore */
  const remoteCore = localStore.get(Buffer.from(PUBLIC_KEY_SENSOR_NODE_2, "hex"))
  remoteCore.ready()

  //**Load Data from Remote Hyperbee */
  const remoteBee = await initHyperbee(remoteCore)

  // Ensure we are connected to at least 1 peer (else getting simply returns null)
  if (remoteBee.feed.writable || remoteBee.feed.peers.length) {
    console.log("Writable or already found peers for core");
  } else {
    console.log("Waiting for peers to connect");
    const [peer] = await once(remoteBee.feed, "peer-add");
    console.log("Connected to peer", peer.remotePublicKey);
  }
  console.log((await bee.get(2)))

  const readStream = await remoteBee.createReadStream()
  for await (const entry of readStream) {
    console.log(entry)
  }

  console.log("finished")
}
