import { Scraper } from './scraper'

class TestingScraper extends Scraper {
  constructor() {
    super()
  }

  async parse(html) {
    return { data: { html }, nextUrls: [] }
  }
}

test("TestingScraper.run('https://jestjs.io')", async () => {
  const scraper = new TestingScraper()
  const url = 'https://jestjs.io'
  const result = await scraper.run(url)
  expect(result).toMatchObject({
    success: true,
    data: { html: url },
    nextUrls: []
  })
})
