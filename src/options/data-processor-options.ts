import { Logger } from 'pino'
import { DataProcessorOptionsInterface, LogLevel } from '../types'

/**
 * Data processor options
 */
export class DataProcessorOptions implements DataProcessorOptionsInterface {
  name = 'spiderman-data-processor'
  logger: Logger
  logLevel: LogLevel = 'info'

  constructor(options: DataProcessorOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
