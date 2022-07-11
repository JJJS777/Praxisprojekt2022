//const Networker = require('@corestore/networker')
const Corestore = require('corestore');
const ram = require('random-access-memory')

const hypercore = require('./hypercore')

//ToDo: init corstore 
//prüfen ob es bereits eine Instanz gibt, falls nicht, neue erzeugen
async function corestoreInit() {

  const store = new Corestore(ram)
  await store.ready()

  // create a hypercore
  const core1 = store.get() /*hier liegt aktuell der fehler, was ist core was ist store? wie spielen 
  die Zusammen braucht man ein hypercore oder wird der von corestore bzw. corestoreNetworker inizialisiert*/

  console.log(core1);

  // load an existing hypercore
  //const core2 = store.get({ key: Buffer(...) })
}

module.exports = {
  corestoreInit
}