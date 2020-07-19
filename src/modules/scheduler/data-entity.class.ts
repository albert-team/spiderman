import { DataProcessorInterface } from '../data-processor/data-processor.interface'

/** Data entity */
export class DataEntity {
  data: object
  dataProcessor: DataProcessorInterface
  retryCount = -1

  constructor(data: object, dataProcessor: DataProcessorInterface) {
    this.data = data
    this.dataProcessor = dataProcessor
  }
}
