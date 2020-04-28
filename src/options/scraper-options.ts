import { Logger } from 'pino'
import { HttpProxy, LogLevel } from '../types'

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
  proxies?: HttpProxy[]
}

/**
 * Scraper options
 */
export class ScraperOptions implements ScraperOptionsInterface {
  name = 'spiderman-scraper'
  timeout = 10 * 1000
  logger: Logger
  logLevel: LogLevel = 'info'
  userAgents = []
  proxies = []

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
