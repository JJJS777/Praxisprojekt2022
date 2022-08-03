// Client

const Hyperswarm = require('hyperswarm')
const Hypercore = require('hypercore')
const Hyperbee = require('hyperbee')
const chalk = require('chalk')
const SHARED_PUBLIC_KEY = '6c51268c8194b05f7f8cbb3cab4869726033d7997a38edadb86f40f63b82fa39'

node3()

async function node3() {
  const core = new Hypercore('./node-3', Buffer.from(SHARED_PUBLIC_KEY, "hex"))
  const bee = new Hyperbee(core, {keyEncoding: "utf-8", valueEncoding: "utf-8"} )
  await core.ready()

  const swarm = new Hyperswarm()
  swarm.on('connection', socket => core.replicate(socket))
  swarm.join(core.discoveryKey, { server: false, client: true })

  console.log(chalk.green('Local-Public-Key: '), core.key.toString('hex'))
  await swarm.flush()


  // Ensure we are connected to at least 1 peer (else getting simply returns null)
  if (bee.feed.writable || bee.feed.peers.length) {
    console.log("Writable or already found peers for core");
  } else {
    console.log("Waiting for peers to connect");
    const [peer] = await once(bee.feed, "peer-add");
    console.log("Connected to peer", peer.remotePublicKey);
  }
  console.log((await bee.get(2)))

  const readStream = await bee.createReadStream()
  for await (const entry of readStream) {
    console.log(entry)
  }

  console.log("finished")
}