import { Logger } from 'pino'
import { LogLevel } from '../types'

/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  name?: string
  logger?: Logger
  logLevel?: LogLevel
}

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
