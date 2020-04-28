import { DataProcessor } from './data-processor'

class SuccessfulDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  async process(): Promise<{ success: boolean }> {
    return { success: true }
  }
}

class FailedDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  async process(): Promise<{ success: boolean }> {
    return { success: false }
  }
}

describe('test suit for DataProcessor.run()', () => {
  test('with SuccessfulDataProcessor', async () => {
    const dataProcessor = new SuccessfulDataProcessor()
    const result = await dataProcessor.run(null)
    expect(result).toMatchObject({ success: true })
  })

  test('with FailedDataProcessor', async () => {
    const dataProcessor = new FailedDataProcessor()
    const result = await dataProcessor.run(null)
    expect(result).toMatchObject({ success: false })
  })
})
