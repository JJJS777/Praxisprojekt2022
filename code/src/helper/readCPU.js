const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

/**Der Befehle geht sicher: cpu=$(cat /sys/class/thermal/thermal_zone0/temp)
echo "CPU_temp: $((cpu/1000))" */

async function getCPUtemperature() {
  // Exec output contains both stderr and stdout outputs
  const dateTimeOutput = await exec('echo "Date $(date +"%d.%m.%y"), Time $(date +"%T")"')
  const temperatureOutput = await exec('cpu=$(cat /sys/class/thermal/thermal_zone0/temp) echo "CPU_temp: $((cpu))"')

  return {
    date: dateTimeOutput.stdout.trim(),
    temp: temperatureOutput.stdout.trim()
  }
};

module.exports = getCPUtemperature
