/**
 * Choose a random element from an array
 * @param {Array} arr - Array
 * @return {*} An element from the array
 */
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Wait for a period of time
 * @param {number} ms - Time to wait, in milliseconds
 */
const wait = async (ms) => new Promise((done) => setTimeout(done, ms))

module.exports = { chooseRandom, wait }
