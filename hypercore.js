const chalk = require('chalk')
const Hypercore = require('hypercore')
const ram = require('random-access-memory')
const { toPromises } = require('hypercore-promisifier')


async function core() {

  // Step 1: Create our initial Hypercore.
  console.log(chalk.green('Step 1: Create the initial Hypercore\n'))


  try {
    const core = new Hypercore((filename) => {
      // filename will be one of: data, bitfield, tree, signatures, key, secret_key
      // the data file will contain all your data concatenated.
      filename = 'test-core-1'

      // just store all files in ram by returning a random-access-memory instance
      return ram()
    })

    // Append two new blocks to the core.
    await core.append(['hello', 'world from 777'])

    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', core.length) // Will be 2.

    await core.close()

  } catch (error) {
    console.error('Error in creating Hypercore', error)
  }

}

module.exports = core
