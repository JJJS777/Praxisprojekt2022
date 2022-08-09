// Client
const chalk = require('chalk')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const pump = require('pump')
const { once } = require("events");
const PUBLIC_KEY_SENSOR_NODE_1 = 'c16e3bc3a12030828b0aa3b4e9fcaee161f4689c86c0737a4b2859fe729c38f7' // Node on Muon bzw. 777 for testing
const PUBLIC_KEY_SENSOR_NODE_2 = '' // Node on Pi


node()

async function node(number) {

  const store = new Corestore('./node-' + number)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  // Create a new swarm instance.
  const swarm = new Hyperswarm()

  await remoteSensor(store, PUBLIC_KEY_SENSOR_NODE_1, swarm)
  //await remoteSensor(store, PUBLIC_KEY_SENSOR_NODE_2)

  console.log("finished")
}


async function remoteSensor(coreStore, remotePublicKey, swarm) {
  //**Init Hypercore with RPK */
  const sensorCore = coreStore.get(Buffer.from(remotePublicKey, "hex"))
  try {
    await sensorCore.ready()
    console.log('Remote Core with Discovery Key: ' + sensorCore.discoveryKey.toString('hex') + ' has been Initialized')
    console.log('Local Core is writeable: ' + sensorCore.writable)
    console.log('Local Core is readable: ' + sensorCore.readable)
  } catch (error) {
    console.error(error)
  }

  //**Connecting to Hyperswam */

  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    pump(
      socket,
      sensorCore.replicate(peerInfo.client),
      socket
    )
  })

  // Start swarming the hypercore.
  swarm.join(sensorCore.discoveryKey, {
    announce: true,
    lookup: true
  })

  //**Init and Query DB */
  const bee = await initHyperbee(sensorCore)

  // Ensure we are connected to at least 1 peer (else getting simply returns null)
  if (bee.feed.writable || bee.feed.peers.length) {
    console.log("Writable or already found peers for core");
  } else {
    console.log("Waiting for peers to connect");
    const [peer] = await once(bee.feed, "peer-add");
    console.log("Connected to peer", peer.remotePublicKey.toString('hex'));
  }

  const readStream = await bee.createReadStream()
  for await (const entry of readStream) {
    console.log(entry)
  }
  //console.log((await bee.get("block #10")))
  console.log(readStream)
}

async function initHyperbee(core) {
  const bee = new Hyperbee(core, { keyEncoding: "utf-8", valueEncoding: "utf-8" })
  await bee.ready
  return bee
}