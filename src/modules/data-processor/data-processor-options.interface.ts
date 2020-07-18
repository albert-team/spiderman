import { Logger } from 'pino'
import { LogLevel } from '../common/log-level.type'

/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  name?: string
  logLevel?: LogLevel
  logger?: Logger
}
