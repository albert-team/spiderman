const DataProcessor = require('./data-processor')

class SuccessfulDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  process() {
    return { success: true }
  }
}

class FailedDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  process() {
    return { success: false }
  }
}

test('SuccessfulDataProcessor.run(null)', async () => {
  const dataProcessor = new SuccessfulDataProcessor()
  const result = await dataProcessor.run(null)
  expect(result).toEqual({ success: true })
})

test('FailedDataProcessor.run(null)', async () => {
  const dataProcessor = new FailedDataProcessor()
  const result = await dataProcessor.run(null)
  expect(result).toEqual({ success: false })
})
