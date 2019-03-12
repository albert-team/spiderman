const axios = require('axios')

const { ScraperOptions } = require('./options')
const { chooseRandom } = require('./utils')

/**
 * Scraper
 * @abstract
 * @param {Array<string>} [userAgents=[]] - User agents
 * @param {Array<ProxyEntity>} [proxies=[]] - Proxies
 * @param {Object} [options={}] - Options
 */
class Scraper {
  constructor(userAgents = [], proxies = [], options = {}) {
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
    /**
     * @private
     * @type {ScraperOptions}
     */
    this.options = new ScraperOptions(options)
    /**
     * @private
     * @type {Object}
     */
    this.axios = axios.create({ timeout: this.options.timeout })
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
    try {
      const res = await this.axios.get(url, {
        headers: { 'User-Agent': chooseRandom(this.userAgents) },
        proxy: chooseRandom(this.proxies)
      })
      if (res.status !== 200) throw new Error()
      const { success = true, data, nextUrls } = await this.parse(res.data)
      return { success, data, nextUrls }
    } catch (err) {
      return { success: false }
    }
  }
}

module.exports = Scraper
