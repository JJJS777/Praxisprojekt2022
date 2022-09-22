const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

// echo "CPU_temp: $((cpu/1000))'C" */

async function getCPUtemperature() {
  // Exec output contains both stderr and stdout outputs
  const dateTimeOutput = await exec('echo "Date $(date +"%d.%m.%y"), Time $(date +"%T")"')
  const temperatureOutput = await exec('echo "CPU_temp: $((cpu/1000))"')

  return {
    date: dateTimeOutput.stdout.trim(),
    temp: temperatureOutput.stdout.trim()
  }
};

module.exports = getCPUtemperature
