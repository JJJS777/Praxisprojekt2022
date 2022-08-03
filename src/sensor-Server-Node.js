const chalk = require('chalk')
const readGPU = require('./helper/readMuonCPU')
const Hypercore = require('hypercore')
const Hyperswarm = require('hyperswarm')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const PUBLIC_KEY_SENSOR_NODE = '6c51268c8194b05f7f8cbb3cab4869726033d7997a38edadb86f40f63b82fa39'
//const core = new Hypercore('./sensor-Server-Node-1', Buffer.from(SHARED_PUBLIC_KEY, "hex"))


//**Init Corestore first time Node is startet */
// const coreStore = initCoreStore('1')
// async function initCoreStore(nodeNumber) {
//   const store = new Corestore('./sensor-Server-Node-' + nodeNumber)
//   return store
// }

//**Run Node Programm */
sensorNode('1')

//**Programm Logic */
async function sensorNode(nodeNumber) {
  const localStore = new Corestore('./sensor-Server-Node-' + nodeNumber)
  const localCore = await localStore.get({ name: 'Local-Sensor-Core' })
  await localCore.ready()
  const localBee = await initHyperbee(localCore)
  const swarm = new Hyperswarm()

  //**DEBUG MSG: Local Hypercore is Initialized */
  console.log(chalk.red('Local Hypercore is Initialized: Sensor-Node-Public-Key: ' + localCore.key.toString('hex')))

  //** write GPU data in local Hyperbee */
  for (var i = 0; i < 5; i++) {
    const returnValues = await readGPU()
    // dateTime = returnValues.date
    // temprature = returnValues.temp
    await localBee.put(returnValues.date, returnValues.temp)
    console.log("PUT Date: " + returnValues.date + " and " + returnValues.temp)
    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', localCore.length)
    await sleep(5000)
  }

  //**Connect to DHT */
  swarm.on('connection', (socket, peerInfo) => {
    localCore.replicate(socket)
  })
  swarm.join(localCore.discoveryKey, { server: true, client: false })
  swarm.flush()

  await queryRemoteNode(localStore, swarm)

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

async function queryRemoteNode(localStore, swarm) {
  //**KLÄREN: Neuen Hyperswarm init oder kann man den bereits init swarm nutzen? */

  /**Init Remote Hypercore */
  const remoteCore = localStore.get(Buffer.from(PUBLIC_KEY_SENSOR_NODE, "hex"))
  remoteCore.ready()

  //**Load Data from Remote Hyperbee */
  const remoteBee = await initHyperbee(remoteCore)

  //**Connect to DHT */
  swarm.on('connection', (socket, peerInfo) => {
    remoteCore.replicate(socket)
  })
  swarm.join(remoteCore.discoveryKey, { server: false, client: true })
  swarm.flush()

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