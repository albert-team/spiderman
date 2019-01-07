const metrohash64 = require('metrohash').metrohash64

/**
 * URL entity
 * @public
 */
class UrlEntity {
  /**
   * Constructor
   * @public
   * @param {string} url - URL
   * @param {Object} scraper - Scraper
   * @param {Object} dataProcessor - Data processor
   */
  constructor(url, scraper, dataProcessor) {
    this.url = url
    this.scraper = scraper
    this.dataProcessor = dataProcessor

    this.attempts = 0
    this.fingerprint = this.getFingerprint()
  }

  /**
   * Get fingerprint
   * @private
   * @return {string} fingerprint
   */
  getFingerprint() {
    return metrohash64(this.url)
  }
}

/**
 * Data entity
 * @public
 */
class DataEntity {
  /**
   * Constructor
   * @public
   * @param {Object} data - Data
   * @param {Object} dataProcessor - Data processor
   */
  constructor(data, dataProcessor) {
    this.data = data
    this.dataProcessor = dataProcessor

    this.attempts = 0
  }
}

/**
 * Proxy entity
 * @public
 */
class ProxyEntity {
  /**
   * Constructor
   * @public
   * @param {string} host - Host
   * @param {number} port - Port number
   * @param {?string} [username] - Username
   * @param {?string} [password] - Password
   */
  constructor(host, port, username, password) {
    this.host = host
    this.port = port
    this.auth = {
      username,
      password
    }
  }
}

module.exports = {
  UrlEntity,
  DataEntity,
  ProxyEntity
}
