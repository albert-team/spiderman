/** HTTP proxy */
export interface HttpProxy {
  host: string
  port: number
  auth: {
    username: string
    password: string
  }
}
