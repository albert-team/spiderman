import { DataProcessingResult } from './data-processing-result.interface'

/**
 * Data processor interface
 */
export interface DataProcessorInterface {
  /**
   * Run
   */
  run(data: object): Promise<DataProcessingResult>
}
