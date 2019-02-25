/**
 * Proxy entity
 */
class ProxyEntity {
  /**
   * @param {string} host - Host
   * @param {number} port - Port number
   * @param {?string} [username] - Username
   * @param {?string} [password] - Password
   */
  constructor(host, port, username, password) {
    /** @type {string} */
    this.host = host
    /** @type {number} */
    this.port = port
    /** @type {{ username: string|undefined, password: string|undefined }} */
    this.auth = { username, password }
  }
}

module.exports = ProxyEntity
