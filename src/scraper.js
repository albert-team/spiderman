/**@type {Object} - import axios */
const axios = require('axios')
/** import { chooseRandom, wait } from "./utils"; */
const { chooseRandom, wait } = require('./utils')

/**
 * Scraper
 * @public
 */
class Scraper {
  /**
   * @constructor
   * @public
   * @param {string[]} userAgents - User Agents
   * @param {Object[]} proxies - Proxies
   */
  constructor(userAgents = [], proxies = []) {
    /**@type {Array} */
    this.userAgents = userAgents
    /**@type {Array} */
    this.proxies = proxies

    /**@type {Object} */
    this.axios = axios.create({
      timeout: 1000
    })
  }

  /**
   * parse data from html
   * @public
   */
  async parse() {}

  /**
   * Scraping URL
   * @public
   * @param {string} url - URL
   * @return {Object} - scraped status, data and next URLs if successful, otherwise return an error
   */
  async run(url) {
    for (let i = 0; i < 2; ++i) {
      const { data: html } = await this.axios.get(url, {
        headers: {
          'User-Agent': chooseRandom(this.userAgents)
        },
        proxy: chooseRandom(this.proxies)
      })
      if (html) {
        const { data, nextUrls } = await this.parse(html)
        return {
          success: true,
          data,
          nextUrls
        }
      }
      await wait(1000)
    }
    return {
      success: false,
      error: ''
    }
  }
}

module.exports = Scraper
