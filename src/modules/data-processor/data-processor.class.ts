import pino, { Logger } from 'pino'
import { DataProcessingResult } from './data-processing-result.interface'
import { DataProcessorOptions } from './data-processor-options.class'
import { DataProcessorOptionsInterface } from './data-processor-options.interface'

/**
 * Data processor
 */
export abstract class DataProcessor {
  private readonly logger: Logger

  constructor(options: DataProcessorOptionsInterface = {}) {
    const opts = new DataProcessorOptions(options)

    this.logger =
      opts.logger ??
      pino({
        name: opts.name,
        level: opts.logLevel,
        useLevelLabels: true,
      })
  }

  /**
   * Run
   */
  public async run(data: object): Promise<DataProcessingResult> {
    try {
      const start = Date.now()
      const { success = true } = await this.process(data)
      const end = Date.now()

      if (success) {
        this.logger.debug({ msg: 'SUCCESS', data })
        return { success: true, executionTime: end - start }
      } else throw new Error()
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', data })
      return { success: false }
    }
  }

  /**
   * Process data
   */
  protected abstract async process(data: object): Promise<{ success: boolean }>
}
