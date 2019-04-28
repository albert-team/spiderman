import DataProcessor from '../data-processor'
import Scraper from '../scraper'

/**
 * URL entity
 */
export default class UrlEntity {
  url: string
  scraper: Scraper
  dataProcessor: DataProcessor
  retryCount: number = -1

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
