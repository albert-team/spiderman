const axios = require('axios')

const { ScraperOptions } = require('./options')
const { chooseRandom } = require('./utils')

/**
 * Scraper
 * @abstract
 * @param {Array<string>} [userAgents=[]] - User agents
 * @param {Array<ProxyEntity>} [proxies=[]] - Proxies
 * @param {ScraperOptions} [options={}] - Options
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
     * @type {ScraperOptions}
     */
    this.options = new ScraperOptions(options)
    /**
     * @private
     * @type {Object}
     */
    this.axios = axios.create({
      timeout: this.options.timeout
    })
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
   * Process a URL
   * @param {string} url - URL
   */
  async process(url) {
    const res = await this.axios.get(url, {
      headers: { 'User-Agent': chooseRandom(this.userAgents) },
      proxy: chooseRandom(this.proxies)
    })
    if (res.status !== 200) throw new Error() // will be catched in run()
    return this.parse(res.data)
  }

  /**
   * Run
   * @async
   * @param {string} url - URL
   * @returns {Object} - Final result
   */
  async run(url) {
    try {
      const start = process.hrtime()
      const { success = true, data, nextUrls } = await this.process(url)
      const end = process.hrtime(start)
      const executionTime = end[0] * 1e9 + end[1]

      return { success, data, nextUrls, executionTime }
    } catch (err) {
      return { success: false }
    }
  }
}

module.exports = Scraper
