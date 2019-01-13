/**@type {function} */
const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
/**@type {function} */
const wait = async (ms) => new Promise((done) => setTimeout(done, ms))
/** 
 * export two function 
 */
module.exports = {
  chooseRandom,
  wait
}
