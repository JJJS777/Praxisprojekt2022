// Client
const chalk = require('chalk')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const remoteSensor = require('./helper/loadRemoteHypercore')
const pump = require('pump')
require('dotenv').config();

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

  // Replicate whenever a new connection is created.
  swarm.on('connection', (socket, peerInfo) => {
    pump(
      socket,
      store.replicate(peerInfo.client),
      socket
    )
  })
  console.log('\n\nDATA FROM SENOR NODE 1:')
  await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)

  //**TODO */
  console.log('\n\nDATA FROM SENOR NODE 2:')
  await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_2, swarm)

  console.log("finished")
}