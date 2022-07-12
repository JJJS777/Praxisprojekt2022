//const Networker = require('@corestore/networker')
const Corestore = require('corestore');
const Networker = require('@corestore/networker')
const ram = require('random-access-memory')
const hc = require('./hypercore')

//ToDo: init corstore prüfen ob es bereits eine Instanz gibt, falls nicht, neue erzeugen
async function corestore() {

  try {
    //ggf. mit random-access-memory oder random-access-storage als Argument arbeiten
    const store = new Corestore('./my-storage')
    await store.ready()

    // loads hypercore
    const core = store.get({key: await hc()})
    await core.ready()

  } catch (error) {
    console.error('Error in creating corstore', error)
  }
}

module.exports = corestore
