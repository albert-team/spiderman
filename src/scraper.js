const axios = require('axios')
const { chooseRandom } = require('./utils')

/**
 * Scraper
 * @abstract
 * @param {Array<string>} [userAgents=[]] - User agents
 * @param {Array<ProxyEntity>} [proxies=[]] - Proxies
 */
class Scraper {
  constructor(userAgents = [], proxies = []) {
    /**
     * @private
     * @type {Array<string>}
     */
    this.userAgents = userAgents
    /**
     * @private
     * @type {Array<ProxyEntity>}
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
   * @async
   * @param {string} html - HTML
   * @returns {{ data: Object, nextUrls: Array<string> }} Result
   */
  async parse(html) {}

  /**
   * Run
   * @async
   * @param {string} url - URL
   * @returns {Object} - Final result
   */
  async run(url) {
    const { data: html } = await this.axios.get(url, {
      headers: { 'User-Agent': chooseRandom(this.userAgents) },
      proxy: chooseRandom(this.proxies)
    })
    if (html) {
      const { data, nextUrls } = await this.parse(html)
      return { success: true, data, nextUrls }
    }
    return { success: false }
  }
}

module.exports = Scraper
