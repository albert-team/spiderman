import DataProcessor from '../data-processor'

/**
 * Data entity
 */
export default class DataEntity {
  data: object
  dataProcessor: DataProcessor
  retryCount: number = -1

  constructor(data: object, dataProcessor: DataProcessor) {
    this.data = data
    this.dataProcessor = dataProcessor
  }
}
