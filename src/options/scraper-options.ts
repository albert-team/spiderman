import pino from 'pino'

/**
 * Scraper options interface
 */
export interface ScraperOptionsInterface {
  timeout?: number
  logger?: pino
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
}

/**
 * Scraper options
 */
export default class ScraperOptions implements ScraperOptionsInterface {
  timeout: number = 10 * 1000
  logger: pino
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent' = 'info'

  constructor(options: ScraperOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
