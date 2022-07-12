const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const { toPromises } = require('hypercore-promisifier')


async function core() {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green('Step 1: Create the initial Hypercore\n'))


  try {
    const core = new Hypercore('./my-hypercore')

    // Append two new blocks to the core.
    await core.append(['hello', 'world from 777'])

    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', core.length) // Will be 2.

    await core.close()
    return core.key

  } catch (error) {
    console.error('Error in creating Hypercore', error)
  }

}

module.exports = core
