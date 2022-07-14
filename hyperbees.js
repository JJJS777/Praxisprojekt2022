const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const Hyperbee = require('hyperbee')
const readCPU = require('./readMuonCPU');


start()

async function start() {
  // A Hyperbee is stored as an embedded index within a single Hypercore.
  const core = new Hypercore(ram)

  // It accepts LevelDB-style key/value encoding options.
  const db = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
  })
  await db.ready()


  for (var i = 0; i < 5; i++) {

      const returnValues = await readCPU()
      // dateTime = returnValues.date
      // temprature = returnValues.temp
      await db.put(returnValues.date, returnValues.temp)
      console.log("PUT Date: " + returnValues.date + " and " + returnValues.temp)
    
    await sleep(5000)
  }

  console.log(chalk.green('Reading KV-pairs with the \'get\' method:\n'))

  // createReadStream can be used to yield KV-pairs in sorted order.
  // createReadStream returns a ReadableStream that supports async iteration.
  for await (const { key, value } of db.createReadStream()) {
    console.log(`${key} -> ${value}`)
  }
}

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}