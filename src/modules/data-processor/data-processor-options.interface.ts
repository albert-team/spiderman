import { Level as LogLevel, Logger } from 'pino'

/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  name?: string
  logLevel?: LogLevel
  logger?: Logger
}
