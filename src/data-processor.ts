import pino from 'pino'
import { DataProcessorOptions, DataProcessorOptionsInterface } from './options'

export interface DataProcessingResult {
  success: boolean
  executionTime?: number
}

/**
 * Data processor
 */
export default abstract class DataProcessor {
  private options: DataProcessorOptions
  public static logger = pino({
    name: 'spiderman-data-processor',
    useLevelLabels: true
  })

  constructor(options: DataProcessorOptionsInterface = {}) {
    this.options = new DataProcessorOptions(options)
  }

  /**
   * Process data
   */
  protected abstract async process(data: object): Promise<{ success: boolean }>

  /**
   * Run
   */
  public async run(data: object): Promise<DataProcessingResult> {
    try {
      const start = Date.now()
      const { success = true } = await this.process(data)
      const end = Date.now()

      DataProcessor.logger.debug({ msg: 'SUCCESS', data })
      if (success) return { success: true, executionTime: (end - start) / 1000 }
      else throw new Error()
    } catch (err) {
      DataProcessor.logger.debug({ msg: 'FAILURE', data })
      return { success: false }
    }
  }
}
