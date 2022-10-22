const chalk = require('chalk')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const remoteSensor = require('./helper/loadRemoteHypercore')
const topic = Buffer.alloc(32).fill('sensor network') // A topic must be 32 bytes
require('dotenv').config();
const initHyperbee = require('./helper/initHyperbee')
const { once } = require("events");
const pump = require('pump')



helpBox('3')

async function helpBox(nodeIndex) {

  const store = new Corestore('../data/nodes/help-' + nodeIndex)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  // Create a new swarm instance.
  const swarm = new Hyperswarm()

  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    console.log(chalk.greenBright('peers Noise public key from peerInfo-objekt on connection: '
      + peerInfo.publicKey.toString('hex')))

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

  // ecco-1
  console.log('\n\nDATA FROM ECCO 1: ')
  const sensorCore1 = await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1)
  let updated = await sensorCore1.update();

  //**Init and Query DB */
  const eccoBeeOne = await initHyperbee(sensorCore1)
  await queryLastX(5, eccoBeeOne)

  // ecco-2
  console.log('\n\nDATA FROM ECCO 2: ')
  const sensorCore2 = await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_2)
  const eccoBeeTwo = await initHyperbee(sensorCore2)
  await queryLastX(5, eccoBeeTwo)
}

//**Helper Funktions */
async function queryLastX(lastX, bee) {
  await once(bee.feed, "peer-add");
  for await (const { key, value } of await bee.createReadStream({ reverse: true, limit: lastX })) {
    console.log(`${key} -> ${value}`)
  }
}