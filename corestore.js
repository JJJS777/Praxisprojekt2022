//const Networker = require('@corestore/networker')
const Corestore = require('corestore');
const Networker = require('@corestore/networker')
const ram = require('random-access-memory')
const hc = require('./hypercore')

async function corestore() {

  try {
    /**Create Corestore instance */
    //ggf. mit random-access-memory oder random-access-storage als Argument arbeiten
    const store = new Corestore('./my-storage')
    await store.ready()

    /**loading hypercore Instance */ 
    const core = store.get({ key: await hc() })
    await core.ready()

    /**Networker Instance */
    const networker = new Networker(store)

    // Start announcing or lookup up a discovery key on the DHT.
    await networker.configure(discoveryKey, { announce: true, lookup: true })

    // Stop announcing or looking up a discovery key.
    // networker.configure(discoveryKey, { announce: false, lookup: false })



    //list of currently-connected peers
    const activeConnectedPeers = networker.peers
    console.log(activeConnectedPeers)

    // Shut down the swarm (and unnanounce all keys)
    await networker.close()
    
  } catch (error) {
    console.error('Error in creating corstore', error)
  }
}

module.exports = corestore
