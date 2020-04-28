import { BloomDuplicateFilter, SetDuplicateFilter } from './entities'

/** Data processing result */
export interface DataProcessingResult {
  success: boolean
  executionTime?: number
}

export type DuplicateFilter = BloomDuplicateFilter | SetDuplicateFilter

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

/** Parsing meta */
export interface ParsingMeta {
  url: string
  request: {
    headers: object
    proxy: HttpProxy
  }
  response: {
    headers: object
    statusCode: number
    statusText: string
  }
}

/** Parsing result */
export interface ParsingResult {
  success?: boolean
  data?: object
  nextUrls?: string[]
}

/** HTTP proxy interface */
export interface HttpProxy {
  readonly host: string
  readonly port: number
  readonly auth: { readonly username: string; readonly password: string }
}

/** Scraping result */
export interface ScrapingResult {
  success: boolean
  data?: object
  nextUrls?: string[]
  executionTime?: number
}
