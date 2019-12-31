/**
 * Proxy entity interface
 */
export interface ProxyEntityInterface {
  readonly host: string
  readonly port: number
  readonly auth: { readonly username: string; readonly password: string }
}

/**
 * Proxy entity
 * @deprecated Since v1.14.0. Use [[ProxyEntityInterface]] instead.
 */
export class ProxyEntity {
  host: string
  port: number
  auth: { username: string; password: string }

  constructor(host: string, port: number, username: string, password: string) {
    this.host = host
    this.port = port
    this.auth = { username, password }
  }
}
