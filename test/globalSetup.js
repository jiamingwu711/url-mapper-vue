const { setup: setupDevServer } = require('jest-dev-server')

module.exports = async function globalSetup() {
  globalThis.servers = await setupDevServer({
    command: `npm run serve:demo`,
    // launchTimeout: 2000,
    port: 4000,
  })
}
