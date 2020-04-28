import { ParsingResult } from '../types'
import { Scraper } from './scraper'

class TestingScraper extends Scraper {
  constructor() {
    super()
  }

  async parse(html): Promise<ParsingResult> {
    return { data: { html }, nextUrls: [] }
  }
}

describe('test suit for TestingScraper.run()', () => {
  test('with https://jestjs.io', async () => {
    const scraper = new TestingScraper()
    const url = 'https://jestjs.io'
    const result = await scraper.run(url)
    expect(result).toMatchObject({
      success: true,
      data: { html: url },
      nextUrls: [],
    })
  })
})
