const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

getCPUtemperature()

async function getCPUtemperature () {
  // Exec output contains both stderr and stdout outputs
  const temperatureOutput = await exec('echo "Date $(date +"%d.%m.%y"), Time $(date +"%T"), CPU_temp: $((cpu/1000))"')
  console.log(temperatureOutput.stdout)
};

