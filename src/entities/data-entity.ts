import { DataProcessor } from '..'

/**
 * Data entity
 */
export class DataEntity {
  data: object
  dataProcessor: DataProcessor
  retryCount = -1

  constructor(data: object, dataProcessor: DataProcessor) {
    this.data = data
    this.dataProcessor = dataProcessor
  }
}
