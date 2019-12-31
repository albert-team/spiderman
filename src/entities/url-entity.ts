import { DataProcessor, Scraper } from '..'

/**
 * URL entity
 */
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

  /**
   * Get the unique fingerprint of the URL (the URL itself by default)
   */
  getFingerprint(): string {
    return this.url
  }
}
