/**
 * Proxy entity
 * @param {string} host - Host
 * @param {number} port - Port number
 * @param {?string} [username] - Username
 * @param {?string} [password] - Password
 */
class ProxyEntity {
  constructor(host, port, username, password) {
    /** @type {string} */
    this.host = host
    /** @type {number} */
    this.port = port
    /** @type {{ username: string, password: string }} */
    this.auth = { username, password }
  }
}

module.exports = ProxyEntity
