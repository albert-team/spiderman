import { DataProcessor } from './data-processor'
import { Scraper } from './scraper'

/** Classification result */
export interface ClassificationResult {
  urlEntity?: UrlEntity
  scraper?: Scraper
  dataProcessor?: DataProcessor
}

/** Data entity */
export class DataEntity {
  data: object
  dataProcessor: DataProcessor
  retryCount = -1

  constructor(data: object, dataProcessor: DataProcessor) {
    this.data = data
    this.dataProcessor = dataProcessor
  }
}

/** Data processing result */
export interface DataProcessingResult {
  success: boolean
  executionTime?: number
}

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

/** Parsing meta */
export interface ParsingMeta {
  url: string
  reqHeaders: object
  resHeaders: object
}

/** Parsing result */
export interface ParsingResult {
  success?: boolean
  data?: object
  nextUrls?: string[]
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

/** Proxy entity interface */
export interface ProxyEntityInterface {
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

/** URL entity */
export class UrlEntity {
  url: string
  scraper: Scraper
  dataProcessor: DataProcessor
  retryCount = -1

  constructor(url: string, scraper: Scraper, dataProcessor: DataProcessor) {
    this.url = url
    this.scraper = scraper
    this.dataProcessor = dataProcessor
  }

  /** Get the unique fingerprint of the URL (the URL itself by default) */
  getFingerprint(): string {
    return this.url
  }
}
