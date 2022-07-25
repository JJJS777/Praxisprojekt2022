// Client

const Hyperswarm = require('hyperswarm')
const Hypercore = require("hypercore")
const chalk = require('chalk')
const KEY = 'b6bfef1450c8467926efc3e22b8376504d2433f87ea60b02dab76ed43e4615d9'// Insert the key served by your server here (as string)

node3()

async function node3(){
  const core = new Hypercore('./node-3', Buffer.from(KEY, "hex"))
  await core.ready()

  const swarm = new Hyperswarm()
  swarm.on('connection', socket => core.replicate(socket))
  swarm.join(core.discoveryKey, { server: false, client: true })
  
  console.log(chalk.green('Local-Public-Key: '), core.key.toString('hex'))
  await swarm.flush()

    // Now we can read blocks from the core.
  // Note that these blocks will be downloaded lazily, when each one requested.
  console.log('First core block:', await core.get(2)) // 'hello'
  console.log('Second core block:', await core.get(3)) // 'world'

  console.log("finished")
}