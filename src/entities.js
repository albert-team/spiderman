/**import metrohash64 */
const metrohash64 = require('metrohash').metrohash64

/**
 * URL entity
 * @public
 */
class UrlEntity {
  /**
   * @constructor
   * @public
   * @param {string} url - URL
   * @param {Object} scraper - Scraper
   * @param {Object} dataProcessor - Data processor
   */
  constructor(url, scraper, dataProcessor) {
    
    /**@type {string} */
    this.url = url

    /**@type {Object} */
    this.scraper = scraper

    /**@type {Object} */
    this.dataProcessor = dataProcessor

    /**@type {number} */
    this.attempts = 0

    /**@type {string} */
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
   * @constructor
   * @public
   * @param {Object} data - Data
   * @param {Object} dataProcessor - Data processor
   */
  constructor(data, dataProcessor) {
    /**@type {Object} */
    this.data = data

    /**@type {Object} */
    this.dataProcessor = dataProcessor

    /**@type {number} */
    this.attempts = 0
  }
}

/**
 * Proxy entity
 * @public
 */
class ProxyEntity {
  /**
   * @constructor
   * @public
   * @param {string} host - Host
   * @param {number} port - Port number
   * @param {?string} [username] - Username
   * @param {?string} [password] - Password
   */
  constructor(host, port, username, password) {
    /**@type {string} */
    this.host = host

    /**@type {number} */
    this.port = port

    /**@type {Object} */
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
