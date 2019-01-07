const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const wait = async (ms) => new Promise((done) => setTimeout(done, ms))


module.exports = { chooseRandom, wait }
