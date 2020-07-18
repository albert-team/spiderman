import { Logger } from 'pino'
import { LogLevel } from '../common/log-level.type'
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
