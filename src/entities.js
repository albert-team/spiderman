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

    this.attempts = 0
  }
}

class ProxyEntity {
  constructor(host, port, username, password) {
    this.host = host
    this.port = port
    this.auth = { username, password }
  }
}


module.exports = { UrlEntity, DataEntity, ProxyEntity }
