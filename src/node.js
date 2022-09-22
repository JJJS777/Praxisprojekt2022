// Client
const chalk = require('chalk')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const remoteSensor = require('./helper/loadRemoteHypercore')
const { pipeline } = require("stream");
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
    const repStream = store.replicate(peerInfo.client, { live: true })
    replicate(socket, repStream)
  })

  console.log('\n\nDATA FROM SENOR NODE 1:')
  await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)

  //**TODO */
  console.log('\n\nDATA FROM SENOR NODE 2:')
  await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_2, swarm)

  console.log("finished")
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