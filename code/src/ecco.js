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
const { once } = require("events");




//**Run Node Programm */
eccoBox('1')

async function eccoBox(nodeIndex) {
  const store = new Corestore('../data/nodes/ecco-' + nodeIndex)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  const localCore = store.get({ name: 'Local-Sensor-Core', sparse: true })
  try {
    await localCore.ready()
    //**DEBUG MSG: Local Hypercore is Initialized */
    console.log(chalk.red('Local Hypercore is Initialized: Sensor-Node-Public-Key: ' + localCore.key.toString('hex')))
    console.log('Local Core is writeable: ' + localCore.writable)
    console.log('Local Core is readable: ' + localCore.readable)
    // clear core
    //await localCore.clear(0, localCore.length)

  } catch (error) {
    console.error(error)
  }

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

  // write to DB
  const bee = await initHyperbee(localCore)

  setInterval(async () => {
    returnValues = await readGPU()
    await bee.put(returnValues.date, returnValues.temp)
    console.log("PUT Date: " + returnValues.date + " and " + returnValues.temp)
    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', localCore.length)
  }, 10000)


  // ecco-1
  console.log('\n\nDATA FROM ECCO 1: ')
  await queryLastX(5,
    await initHyperbee(
      await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)))

  // ecco-2
  console.log('\n\nDATA FROM ECCO 2: ')
  await queryLastX(5,
    await initHyperbee(
      await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)))

}


//**Helper Funktions */

async function queryLive(bee) {
  await once(bee.feed, "peer-add");
  for await (const { key, value } of bee.createHistoryStream({ live: true })) {
    console.log(`${key} -> ${value}`)
  }
}

async function queryLastX(lastX, bee) {
  await once(bee.feed, "peer-add");
  for await (const { key, value } of await bee.createReadStream({ reverse: true, limit: lastX })) {
    console.log(`${key} -> ${value}`)
  }
}

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