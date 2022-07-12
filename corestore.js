//const Networker = require('@corestore/networker')
const Corestore = require('corestore');
const Networker = require('@corestore/networker')
const ram = require('random-access-memory')
const core = require('./hypercore')

//ToDo: init corstore prüfen ob es bereits eine Instanz gibt, falls nicht, neue erzeugen
async function corestore() {

  try {
    //ggf. mit random-access-memory oder random-access-storage als Argument arbeiten
    const store = new Corestore('./my-storage')
    await store.ready()
    
    // loads hypercore
    const testCore = store.get({name: 'test-core-1'})
  } catch (error) {
    console.error('Error in creating corstore', error)
  }
}

module.exports = corestore
