const Hyperbee = require('hyperbee')

module.exports = async function initHyperbee(core) {
    const bee = new Hyperbee(core, { keyEncoding: "utf-8", valueEncoding: "utf-8" })
    bee.ready()
    return bee
}