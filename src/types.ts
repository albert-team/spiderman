import { Logger } from 'pino'
import { BloomDuplicateFilter, SetDuplicateFilter } from './entities'

/** Data processing result */
export interface DataProcessingResult {
  success: boolean
  executionTime?: number
}

/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  name?: string
  logger?: Logger
  logLevel?: LogLevel
}

export type DuplicateFilter = BloomDuplicateFilter | SetDuplicateFilter

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'

/** Parsing meta */
export interface ParsingMeta {
  url: string
  request: {
    headers: object
    proxy: ProxyEntityInterface
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

/** Proxy entity interface */
export interface ProxyEntityInterface {
  readonly host: string
  readonly port: number
  readonly auth: { readonly username: string; readonly password: string }
}

/**
 * Scheduler options interface
 */
export interface SchedulerOptionsInterface {
  shortRetries?: number
  longRetries?: number
  maxScrapers?: number
  maxDataProcessors?: number
  tasksPerMinPerQueue?: number
  useRedisBloom?: boolean
  logger?: Logger
  logLevel?: LogLevel
}

/**
 * Scraper options interface
 */
export interface ScraperOptionsInterface {
  name?: string

  /** In milliseconds */
  timeout?: number

  logger?: Logger
  logLevel?: LogLevel
  userAgents?: string[]
  proxies?: ProxyEntityInterface[]
}

/** Scraping result */
export interface ScrapingResult {
  success: boolean
  data?: object
  nextUrls?: string[]
  executionTime?: number
}
