// Client
const chalk = require('chalk')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const Networker = require('@corestore/networker')
const { once } = require("events");
const PUBLIC_KEY_SENSOR_NODE_1 = '9c9f0245a770412ba9bd157bf64d75f3fdfc8a3575a5b3c6fa5f551c470e6d3d' // Node on 777
const PUBLIC_KEY_SENSOR_NODE_2 = '' // Node on Moun


node('3')

async function node(number) {

  try {
    const store = new Corestore('./node-' + number)
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  try {
    const sensorCore1 = store.get(Buffer.from(PUBLIC_KEY_SENSOR_NODE_1, "hex"))
    await sensorCore1.ready()
    console.log('Remote Core with ID: ' + sensorCore1 + ' has been Initialized')
  } catch (error) {
    console.error(error)
  }

  try {
    const networker = new Networker(store)

    //**Connect to DHT */
    // Start announcing or lookup up a discovery key on the DHT.
    await networker.configure(sensorCore1.discoveryKey, { announce: true, lookup: true })
  } catch (error) {
    console.error(error)
  }

  // Is the networker "swarming" the given core?
  if (networker.joined(sensorCore1.discoveryKey) == true) {
    console.log('Networker swarmed the given Core...')
  } else {
    console.log('Networker faild to swarm the given Core...')
  }

  // Has the networker attempted to connect to all known peers of the core?
  if (networker.flushed(sensorCore1.discoveryKey) == true) {
    console.log('Networker has attempted to connect to all known peers of the core...')
  } else {
    console.log('Networker hasnt attempted to connect to all known peers of the core...')
  }

  console.log('The list of currently-connected peers: ', networker.peers)

  try {
    console.log('Read Remote Core Sensor Node 2: ' + await sensorCore1.get(0) + await sensorCore1.get(1) + await sensorCore1.get(2))
  } catch (error) {
    console.error(error)
  }

  console.log("finished")
}




async function remoteSensor1(coreStore, networker) {
  const sensorCore1 = store.get(Buffer.from(PUBLIC_KEY_SENSOR_NODE_1, "hex"))
  await sensorCore1.ready()
}

async function remoteSensor2(coreStore, networker) {
  const sensorCore2 = coreStore.get(Buffer.from(PUBLIC_KEY_SENSOR_NODE_2, "hex"))
  await sensorCore2.ready()

  console.log('Remote Core with ID: ' + sensorCore2.publicKey + ' has been Initialized')

  const beeSensor2 = await initHyperbee(sensorCore2)

  //**Connect to DHT */
  // Start announcing or lookup up a discovery key on the DHT.
  await networker.configure(sensorCore2.discoveryKey, { announce: true, lookup: true })

  // Is the networker "swarming" the given core?
  if (networker.joined(sensorCore2.discoveryKey) == true) {
    console.log('Networker swarmed the given Core...')
  } else {
    console.log('Networker faild to swarm the given Core...')
  }

  // Has the networker attempted to connect to all known peers of the core?
  if (networker.flushed(sensorCore2.discoveryKey) == true) {
    console.log('Networker has attempted to connect to all known peers of the core...')
  } else {
    console.log('Networker hasnt attempted to connect to all known peers of the core...')
  }

  console.log('The list of currently-connected peers: ', networker.peers)
  networker.on('peer-add', peer => {
    console.log('Peer:', peer, 'has been added')
  })

  // Ensure we are connected to at least 1 peer (else getting simply returns null)
  if (beeSensor2.feed.writable || beeSensor2.feed.peers.length) {
    console.log("Writable or already found peers for core");
  } else {
    console.log("Waiting for peers to connect");
    const [peer] = await once(beeSensor2.feed, "peer-add");
    console.log("Connected to peer", peer.remotePublicKey);
  }
  console.log((await beeSensor2.get(2)))

  const readStream = await beeSensor2.createReadStream()
  for await (const entry of readStream) {
    console.log(entry)
  }
}


async function initHyperbee(core) {
  const bee = new Hyperbee(core, { keyEncoding: "utf-8", valueEncoding: "utf-8" })
  await bee.ready
  return bee
}