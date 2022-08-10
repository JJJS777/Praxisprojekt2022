// Client
const chalk = require('chalk')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const pump = require('pump')
const remoteSensor = require('./helper/loadRemoteHypercore')
const { once } = require("events");
require('dotenv').config();

node('777')

async function node(number) {
  console.log(process.env.PUBLIC_KEY_SENSOR_NODE_1)

  const store = new Corestore('./node-' + number)
  try {
    await store.ready()
  } catch (error) {
    console.error(error)
  }

  // Create a new swarm instance.
  const swarm = new Hyperswarm()

  console.log('\n\nDATA FROM SENOR NODE 1:')
  await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_1, swarm)

  //**TODO */
  // console.log('\n\nDATA FROM SENOR NODE 2:')
  // await remoteSensor(store, process.env.PUBLIC_KEY_SENSOR_NODE_2, swarm)

  console.log("finished")
}