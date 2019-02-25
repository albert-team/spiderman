const axios = require('axios')
const { chooseRandom } = require('./utils')

/**
 * Scraper
 * @abstract
 */
class Scraper {
  /**
   * @param {Array<string>} userAgents - User agents
   * @param {Array<ProxyEntity>} proxies - Proxies
   */
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
   * @param {string} html - HTML
   * @return {{ data: Object, nextUrls: Array<string> }} Result
   */
  async parse(html) {}

  /**
   * Run
   * @param {string} url - URL
   * @return {Object} - Final result
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
