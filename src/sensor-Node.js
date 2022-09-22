const chalk = require('chalk')
const readGPU = require('./helper/readMuonCPU')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const remoteSensor = require('./helper/loadRemoteHypercore')
const { pipeline } = require("stream");
const pump = require('pump')
require('dotenv').config();
const initHyperbee = require('./helper/initHyperbee')
const topic = Buffer.alloc(32).fill('sensor network') // A topic must be 32 bytes



//**Run Node Programm */
sensorNode('1')

async function sensorNode(nodeNumber) {
  const localStore = new Corestore('./sensor-Server-Node-' + nodeNumber)
  try {
    await localStore.ready()
  } catch (error) {
    console.error(error)
  }

  const localCore = localStore.get({ name: 'Local-Sensor-Core' })
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
    await sleep(10000)
  }

  /**Connect to DHT */
  const swarm = new Hyperswarm() //nur ein mal je code

  //ein mal, wenn es sich um einen SnesorNode handelt und dann noch mal, wenn remote core geladen wird?
  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    pump(
      socket,
      store.replicate(peerInfo.client),
      socket
    )
  })

  // Start swarming the hypercore.
  swarm.join(topic, {
    announce: true,
    lookup: true
  })
  //swarm.flush()
  // console.log('\n\nDATA FROM SENOR NODE 1:')
  // await remoteSensor(localStore, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)
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