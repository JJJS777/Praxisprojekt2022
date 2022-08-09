const chalk = require('chalk')
const readGPU = require('./helper/readMuonCPU')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const pump = require('pump')
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


  const bee = await initHyperbee(localCore)
  for (var i = 0; i < 2; i++) {
    const returnValues = await readGPU()
    await bee.put(returnValues.date, returnValues.temp)
    console.log("PUT Date: " + returnValues.date + " and " + returnValues.temp)
    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', localCore.length)
    await sleep(2500)
  }


  /**Connect to DHT */
  const swarm = new Hyperswarm()
  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    pump(
      socket,
      localCore.replicate( peerInfo.client ),
      socket
    )
  })

  // Start swarming the hypercore.
  swarm.join(localCore.discoveryKey, {
    announce: true,
    lookup: true
  })
  swarm.flush()

}


//**Helper Funktions */
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function initHyperbee(core) {
  const bee = new Hyperbee(core, { keyEncoding: "utf-8", valueEncoding: "utf-8" })
  bee.ready
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
