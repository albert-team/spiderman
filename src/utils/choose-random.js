/**
 * Choose a random element from an array
 * @param {Array} arr - Array
 * @returns {any} An element from the array
 */
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

module.exports = chooseRandom
