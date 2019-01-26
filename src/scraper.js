const axios = require('axios')
const { chooseRandom, wait } = require('./utils')

/**
 * Scraper
 */
class Scraper {
  /**
   * Constructor
   * @param {string[]} userAgents - User Agents
   * @param {Object[]} proxies - Proxies
   */
  constructor(userAgents = [], proxies = []) {
    /**
     * @private
     * @type {string[]}
     */
    this.userAgents = userAgents
    /**
     * @private
     * @type {Object[]}
     */
    this.proxies = proxies
    /**
     * @private
     * @type {Object}
     */
    this.axios = axios.create({ timeout: 10000 })
  }

  /**
   * Parse result from HTML
   * @protected
   * @abstract
   * @param {string} html - HTML
   * @return {Object} Result
   */
  async parse(html) {}

  /**
   * Run
   * @param {string} url - URL
   * @return {Object} - Final result
   */
  async run(url) {
    for (let i = 0; i < 2; ++i) {
      const { data: html } = await this.axios.get(url, {
        headers: { 'User-Agent': chooseRandom(this.userAgents) },
        proxy: chooseRandom(this.proxies)
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
