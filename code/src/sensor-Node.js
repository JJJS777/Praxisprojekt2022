const chalk = require('chalk')
const readGPU = require('./helper/readGPU')
const readCPU = require('./helper/readCPU')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const remoteSensor = require('./helper/loadRemoteHypercore')
const { pipeline } = require("stream");
require('dotenv').config();
const initHyperbee = require('./helper/initHyperbee')
const topic = Buffer.alloc(32).fill('sensor network') // A topic must be 32 bytes
const pump = require('pump')




//**Run Node Programm */
sensorNode('1')

async function sensorNode(nodeIndex) {
  const store = new Corestore('../data/nodes/sensor-Server-Node-' + nodeIndex)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  const localCore = store.get({ name: 'Local-Sensor-Core' })
  try {
    await localCore.ready()
    //**DEBUG MSG: Local Hypercore is Initialized */
    console.log(chalk.red('Local Hypercore is Initialized: Sensor-Node-Public-Key: ' + localCore.key.toString('hex')))
    console.log('Local Core is writeable: ' + localCore.writable)
    console.log('Local Core is readable: ' + localCore.readable)
    //console.log('Local Cores Discovery Key: ' + localCore.discoveryKey.toString('hex'))
  } catch (error) {
    console.error(error)
  }

  const bee = await initHyperbee(localCore)

  /**Connect to DHT */
  const swarm = new Hyperswarm() //nur ein mal je code

  //ein mal, wenn es sich um einen SnesorNode handelt und dann noch mal, wenn remote core geladen wird?
  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    console.log('peers Noise public key from peerInfo-objekt on connection:'
      + peerInfo.publicKey.toString('hex'))

    const repStream = store.replicate(peerInfo.client, { live: true })
    pump(
      socket,
      repStream,
      socket
    )
  })

  // Start swarming the hypercore.
  swarm.join(topic, {
    announce: true,
    lookup: true
  })
  swarm.flush()

  await readGPU(localCore, bee)

  // console.log('\n\nDATA FROM SENOR NODE 1:')
  // await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)
}


//**Helper Funktions */
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
  console.log("Called sendMsg");
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
  console.log("Called readMsg");
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