// Client
const chalk = require('chalk')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const remoteSensor = require('./helper/loadRemoteHypercore')
const { pipeline } = require("stream");
const topic = Buffer.alloc(32).fill('sensor network') // A topic must be 32 bytes
require('dotenv').config();
const initHyperbee = require('./helper/initHyperbee')
const { once } = require("events");
const pump = require('pump')



helpBox('3')

async function helpBox(nodeIndex) {

  const store = new Corestore('../data/nodes/node-' + nodeIndex)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  // Create a new swarm instance.
  const swarm = new Hyperswarm()

  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    console.log('peers Noise public key from peerInfo-objekt on connection: '
      + peerInfo.publicKey.toString('hex'))

    // console.log('\n\nPeer-Info-Object:')
    // console.log(peerInfo)

    // console.log('\n\nSocket:')
    // console.log(socket)

    const repStream = store.replicate(peerInfo.client, { live: true })
    pump(
      socket,
      repStream,
      socket
    )
  })

  //**Connecting to Hyperswam */
  // Start swarming the hypercore.
  swarm.join(topic, {
    announce: true,
    lookup: true
  })

  console.log('\n\nDATA FROM SENOR NODE 1: ')
  const sensorCore1 = await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1)
  let updated = await sensorCore1.update();

  // // Note that this will never be consider downloaded as the range
  // // will keep waiting for new blocks to be appended.
  //await sensorCore1.download({ start: 0, end: -1 })

  //**Init and Query DB */
  const bee = await initHyperbee(sensorCore1)

  //await sensorCore1.get(sensorCore1.length - 1)
  console.log("core was updated?", updated);
  console.log("length is", await sensorCore1.length);
  console.log('How many blocks are contiguously available starting from the first block of this core?: ' + sensorCore1.contiguousLength)
  console.log("core was updated?", updated)

  // // const [peer] = await once(bee.feed, "peer-add");
  const readStream = bee.createHistoryStream({ live: true })
  for await (const { key, value } of bee.createHistoryStream({ live: true })) {
    console.log(`${key} -> ${value}`)
  }

  if (updated) {
    console.log('updated changed to: ' + updated)
  }
  console.log("---END-OF-CODE---")
}

//**Helper Funktions */
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function replicate(socket, stream) {
  console.log("Called replicate");
  pipeline(socket, stream, socket, (err) => {
    if (err) {
      console.error("Pipeline failed.", err);
    } else {
      console.log("Pipeline succeeded.");
    }
  });
}


async function sendMsg(socket, nodeIndex) {
  console.log("Called sendMsg" + Date.now());
  try {
    socket.write(
      JSON.stringify({
        index: nodeIndex,
        typ: "Normal-Node",
        typNumber: 1,
        msg: "empty",
      })
    );
  } catch (error) {
    console.error(error);
  }
}

async function readMsg(socket) {
  console.log("Called readMsg" + Date.now());
  socket.on("data", (data) => {
    const resData = JSON.parse(data);
    console.log("received: " + resData.typ + " " + resData.index);
  });
}

function pumpRep(socket, stream) {
  pump(
    socket,
    stream,
    socket
  )
}
