const { Scheduler, Scraper, DataProcessor } = require('..')
const wait = require('../src/utils/wait')

class ProxyScraper extends Scraper {
  constructor() {
    super()
  }

  async run(url) {
    let nextUrls = []
    if (url === 'url1') nextUrls = ['url2', 'url3', 'url4']
    else if (url === 'url3') {
      await wait(1000)
      nextUrls = ['url5']
    } else if (url === 'url4') nextUrls = ['url2', 'url6']
    return { success: true, data: { url }, nextUrls }
  }
}

class ProxyDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  async run(data) {
    return { success: true }
  }
}

class Manager extends Scheduler {
  constructor() {
    super('url1', { verbose: true })
  }

  classifyUrl() {
    return {
      scraper: new ProxyScraper(),
      dataProcessor: new ProxyDataProcessor()
    }
  }
}

const manager = new Manager()

// if this block uncommented, the scheduler will crash as we try to schedule tasks after it stopped
// manager.once('idle', async () => {
//   console.log('SCHEDULER IS IDLE')
//   await manager.stop()
//   await manager.disconnect()
// })

manager.start()

setTimeout(() => {
  manager.scrapeUrl('url2') // won't do anything
  manager.scrapeUrl('url4', false) // will scrape url4, but not url6
}, 3000)
