import { HttpProxy } from './http-proxy.interface'

/** Parsing meta */
export interface ParsingMeta {
  url: string
  request: {
    headers: Record<string, string>
    proxy: HttpProxy
  }
  response: {
    headers: Record<string, string>
    statusCode: number
    statusText: string
  }
}
