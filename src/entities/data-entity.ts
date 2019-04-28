import DataProcessor from '../data-processor'

/**
 * Data entity
 */
class DataEntity {
  data: object
  dataProcessor: DataProcessor
  retryCount: number

  constructor(data: object, dataProcessor: DataProcessor) {
    this.data = data
    this.dataProcessor = dataProcessor
    this.retryCount = -1
  }
}

export default DataEntity
