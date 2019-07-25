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
  public readonly logger: pino

  constructor(options: DataProcessorOptionsInterface) {
    this.options = new DataProcessorOptions(options)

    this.logger = this.options.logger ? this.options.logger : pino({
      name: 'spiderman-data-processor',
      level: this.options.logLevel,
      useLevelLabels: true
    })
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

      if (success) return { success: true, executionTime: (end - start) / 1000 }
      else throw new Error()
    } catch (err) {
      return { success: false }
    }
  }
}
