import DataProcessor from '../data-processor'
import Scraper from '../scraper'

/**
 * URL entity
 */
class UrlEntity {
  url: string
  scraper: Scraper
  dataProcessor: DataProcessor
  retryCount: number

  constructor(url: string, scraper: Scraper, dataProcessor: DataProcessor) {
    this.url = url
    this.scraper = scraper
    this.dataProcessor = dataProcessor
    this.retryCount = -1
  }

  /**
   * Get the unique fingerprint of the URL (the URL itself by default)
   */
  getFingerprint(): string {
    return this.url
  }
}

export default UrlEntity
