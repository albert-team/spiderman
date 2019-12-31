/**
 * Data processor options interface
 */
export interface DataProcessorOptionsInterface {
  /** Unused option */
  timeout?: number
}

/**
 * Data processor options
 */
export default class DataProcessorOptions implements DataProcessorOptionsInterface {
  /** Unused option */
  timeout: number = 10 * 1000

  constructor(options: DataProcessorOptionsInterface = {}) {
    Object.assign(this, options)
  }
}
