import pino, { Logger } from 'pino'
import { DataProcessorOptions, DataProcessorOptionsInterface } from '../options'
import { DataProcessingResult } from '../types'

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
        formatters: {
          level: (label): object => new Object({ level: label }),
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
      if (success) return { success: true, executionTime: end - start }
      else throw new Error()
    } catch (err) {
      this.logger.debug({ msg: 'FAILURE', data })
      return { success: false }
    }
  }
}
