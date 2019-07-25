import pino from 'pino'

/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  logger?: pino
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
}

/**
 * Data processor options
 */
export default class DataProcessorOptions implements DataProcessorOptionsInterface {
  logger: pino
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent' = 'info'

  constructor(options: DataProcessorOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
