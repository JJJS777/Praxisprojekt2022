const chalk = require('chalk')
const hypercore = require('hypercore')
const { toPromises } = require('hypercore-promisifier')


async function core () {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green('Step 1: Create the initial Hypercore\n'))

  // Create our first Hypercore, saving blocks to the 'main' directory.
  // We'll wrap it in a Promises interface, to make the walkthrough more readable.
  const core = toPromises(hypercore('./main', {
    valueEncoding: 'utf-8' // The blocks will be UTF-8 strings.
  }))

  // Append two new blocks to the core.
  await core.append(['hello', 'world from muon'])

  // After the append, we can see that the length has updated.
  console.log('Length of the first core:', core.length) // Will be 2.

  // And we can read out the blocks.
  console.log('First block:', await core.get(0))
  console.log('Second block:', await core.get(1))
}

module.exports = core
