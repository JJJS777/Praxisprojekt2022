const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

/**Der Befehle geht sicher: cpu=$(cat /sys/class/thermal/thermal_zone0/temp)
echo "GPU_$(/opt/vc/bin/vcgencmd measure_temp), CPU_temp: $((cpu/1000))'C" */

async function getGPUtemperature(core, hyperbee) {

  const bee = hyperbee
  const localCore = core

  // Exec output contains both stderr and stdout outputs
  const dateTimeOutput = await exec('echo "Date $(date +"%d.%m.%y"), Time $(date +"%T")"')
  const temperatureOutput = await exec('echo "GPU_$(/opt/vc/bin/vcgencmd measure_temp)"')

  for (let i = 0; i > 2; i++) {
    await bee.put(dateTimeOutput.stdout.trim(), temperatureOutput.stdout.trim())
    console.log("PUT Date: " + dateTimeOutput.stdout.trim() + " and " + temperatureOutput.stdout.trim())
    // After the append, we can see that the length has updated.
    console.log('Length of the first core:', localCore.length)
    await sleep(20000)
  }
};

//**Helper Funktions */
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = getGPUtemperature

