import { Logger } from 'pino'

/**
 * Data processor options interface
 */
interface DataProcessorOptionsInterface {
  logger?: Logger
  logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
}

/**
 * Data processor options
 */
class DataProcessorOptions implements DataProcessorOptionsInterface {
  logger: Logger
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent' = 'info'

  constructor(options: DataProcessorOptionsInterface = {}) {
    Object.assign(this, options)
  }
}

export default DataProcessorOptions
export { DataProcessorOptionsInterface }
