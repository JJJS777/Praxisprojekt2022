const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const soloCoreLoggo = 'LOGGO FROM SOLO-CORE-APP: '

async function core() {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green(soloCoreLoggo + 'Step 1: Create the initial Hypercore\n'))


  try {
    /**Creating Hypercore Instance */
    const core = new Hypercore('./my-hypercore', this.key, { createIfMissing: true, valueEncoding: 'json' })

    // Append two new blocks to the core.
    await core.append(['hello', 'world from 777'])

    // After the append, we can see that the length has updated.
    console.log( soloCoreLoggo + 'Length of the first core:', core.length) // Will be 2.

    await core.close()
    return core

  } catch (error) {
    console.error('Error in creating Hypercore', error)
  }

}

module.exports = core
