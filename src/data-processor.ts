interface DataProcessingResult {
  success: boolean
  executionTime?: number
}

/**
 * Data Processor
 */
export default abstract class DataProcessor {
  /**
   * Process data
   */
  protected abstract async process(data: object): Promise<{ success: boolean }>

  /**
   * Run
   */
  public async run(data: object): Promise<DataProcessingResult> {
    try {
      const start = process.hrtime()
      const { success = true } = await this.process(data)
      const end = process.hrtime(start)
      const executionTime = end[0] * 1e9 + end[1]

      if (success) return { success: true, executionTime }
      else throw new Error()
    } catch (err) {
      return { success: false }
    }
  }
}
