/**
 * Wait for a period of time
 * @private
 * @async
 * @param {number} ms - Time to wait, in milliseconds
 */
const wait = async (ms) => new Promise((done) => setTimeout(done, ms))

module.exports = wait
