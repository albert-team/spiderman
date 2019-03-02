const Scraper = require('./scraper')

class TestingScraper extends Scraper {
  constructor() {
    super()
  }

  parse(html) {
    return { data: { html }, nextUrls: [] }
  }
}

test("TestingScraper.run('https://jestjs.io')", async () => {
  const scraper = new TestingScraper()
  const url = 'https://jestjs.io'
  const result = await scraper.run(url)
  expect(result).toEqual({
    success: true,
    data: { html: url },
    nextUrls: []
  })
})
