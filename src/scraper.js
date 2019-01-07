const axios = require('axios')

const { chooseRandom, wait } = require('./utils')


class Scraper {
  constructor(userAgents=[], proxies=[]) {
    this.userAgents = userAgents
    this.proxies = proxies
    this.axios = axios.create({ timeout: 1000 })
  }

  async parse() { }

  async run(url) {
    for (let i = 0; i < 2; ++i) {
      const { data: html } = await this.axios.get(url, {
        headers: { 'User-Agent': chooseRandom(this.userAgents) },
        proxy: chooseRandom(this.proxies),
      })
      if (html) {
        const { data, nextUrls } = await this.parse(html)
        return { success: true, data, nextUrls }
      }
      await wait(1000)
    }
    return { success: false, error: '' }
  }
}


module.exports = Scraper
