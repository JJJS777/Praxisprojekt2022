const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

/**Der Befehle geht sicher: cpu=$(cat /sys/class/thermal/thermal_zone0/temp)
echo "GPU_$(/opt/vc/bin/vcgencmd measure_temp), CPU_temp: $((cpu/1000))'C" */

async function getGPUtemperature() {
  // Exec output contains both stderr and stdout outputs
  const dateTimeOutput = await exec('echo "Date $(date +"%d.%m.%y"), Time $(date +"%T")"')
  const temperatureOutput = await exec('echo "GPU_$(/opt/vc/bin/vcgencmd measure_temp)"')

  return {
    date: dateTimeOutput.stdout.trim(),
    temp: temperatureOutput.stdout.trim()
  }
};

module.exports = getGPUtemperature

