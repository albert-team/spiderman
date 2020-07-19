import { Level as LogLevel, Logger } from 'pino'
import { HttpProxy } from './http-proxy.interface'

/**
 * Scraper options interface
 */
export interface ScraperOptionsInterface {
  name?: string

  /** In milliseconds */
  timeout?: number

  userAgents?: string[]
  proxies?: HttpProxy[]
  logLevel?: LogLevel
  logger?: Logger
}
