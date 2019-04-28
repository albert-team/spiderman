/**
 * Proxy entity
 */
export default class ProxyEntity {
  host: string
  port: number
  auth: { username: string; password: string }

  constructor(host: string, port: number, username: string, password: string) {
    this.host = host
    this.port = port
    this.auth = { username, password }
  }
}
