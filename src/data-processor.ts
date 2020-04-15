import pino, { Logger } from 'pino'
import { DataProcessingResult } from './entities'
import { DataProcessorOptions, DataProcessorOptionsInterface } from './options'

/**
 * Data processor
 */
export abstract class DataProcessor {
  private readonly options: DataProcessorOptions
  public readonly logger: Logger

  constructor(options: DataProcessorOptionsInterface = {}) {
    this.options = new DataProcessorOptions(options)

    this.logger = this.options.logger
      ? this.options.logger
      : pino({
          name: this.options.name,
          level: this.options.logLevel,
          formatters: {
            level(label): object {
              return { level: label }
            },
          },
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

      this.logger.debug({ msg: 'SUCCESS', data })
      if (success) return { success: true, executionTime: (end - start) / 1000 }
      else throw new Error()
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', data })
      return { success: false }
    }
  }
}
