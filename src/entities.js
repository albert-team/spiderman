class UrlEntity {
  constructor(url, fingerprint, scraper, dataProcessor) {
    this.url = url
    this.fingerprint = fingerprint
    this.scraper = scraper
    this.dataProcessor = dataProcessor
    this.attempts = 0
  }
}

class DataEntity {
  constructor(data, dataProcessor) {
    this.data = data
    this.dataProcessor = dataProcessor
  }
}


exports = { UrlEntity, DataEntity }
