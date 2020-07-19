import { Level as LogLevel, Logger } from 'pino'
import { DataProcessorOptionsInterface } from './data-processor-options.interface'

/**
 * Data processor options class
 */
export class DataProcessorOptions implements DataProcessorOptionsInterface {
  name = 'spiderman-data-processor'
  logLevel: LogLevel = 'info'
  logger?: Logger

  constructor(options: DataProcessorOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
