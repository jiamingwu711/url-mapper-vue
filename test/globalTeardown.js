const { teardown } = require('jest-dev-server')

module.exports = async function globalTeardown() {
  await teardown(globalThis.servers)
  console.log("Local dev server has been stopped.");
}
