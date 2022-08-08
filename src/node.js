// Client
const chalk = require('chalk')
const Hyperbee = require('hyperbee')
const Corestore = require('corestore')
const Networker = require('@corestore/networker')
const { once } = require("events");
const PUBLIC_KEY_SENSOR_NODE_1 = '0adbd825e8491b5fcc11562ee4fefb1cc24f3101e8acb76d582812965b688f48' // Node on Muon bzw. 777 for testing
const PUBLIC_KEY_SENSOR_NODE_2 = '' // Node on Pi


node('3')

async function node(number) {

  const store = new Corestore('./node-' + number)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  const sensorCore1 = store.get(Buffer.from(PUBLIC_KEY_SENSOR_NODE_1, "hex"))

  try {
    await sensorCore1.ready()
    console.log('Remote Core with Discovery Key: ' + sensorCore1.discoveryKey.toString('hex') + ' has been Initialized')
    console.log('Local Core is writeable: ' + sensorCore1.writable)
    console.log('Local Core is readable: ' + sensorCore1.readable)
  } catch (error) {
    console.error(error)
  }


  const networker = new Networker(store)
  try {
    //**Connect to DHT */
    // Start announcing or lookup up a discovery key on the DHT.
    await networker.configure(sensorCore1.discoveryKey, { announce: true, lookup: true })

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

    // Peer events and information.
    console.log(networker.peers) // Outputs an array of peer objects.
    networker.on('peer-add', peer => {
      console.log('new peer added: ' + peer.publicKey)
      console.log('The list of currently-connected peers: ', networker.peers)

    })




  } catch (error) {
    console.error(error)
  }

  console.log(await sensorCore1.get(0))
  console.log(await sensorCore1.get(1))
  console.log(await sensorCore1.get(2))


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