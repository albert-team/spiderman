import { Logger } from 'pino'

/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  logger?: Logger
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
}

/**
 * Data processor options
 */
export class DataProcessorOptions implements DataProcessorOptionsInterface {
  logger: Logger
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent' = 'info'

  constructor(options: DataProcessorOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
