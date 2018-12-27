const axios = require('axios')


const chooseRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const wait = async (ms) => new Promise((done) => setTimeout(done, ms))

class Scraper {
  constructor(userAgents=[], proxies=[]) {
    this.userAgents = userAgents
    this.proxies = proxies
    this.axios = axios.create({ timeout: 1000 })

    this.data = {}
    this.nextUrls = []
  }

  async parse(html) { }

  async run(url) {
    for (let i = 0; i < 2; ++i) {
      const { data: html } = await this.axios.get(url, {
        headers: { 'User-Agent': chooseRandom(this.userAgents) },
        proxy: chooseRandom(this.proxies),
      })
      if (data) {
        await this.parse(html)
        return { success: true, data: this.data, nextUrls: this.nextUrls }
      }
      await wait(1000)
    }
    return { success: false, error: '' }
  }
}


module.exports = Scraper
