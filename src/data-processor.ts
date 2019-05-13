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
      const start = Date.now()
      const { success = true } = await this.process(data)
      const end = Date.now()

      if (success) return { success: true, executionTime: (end - start) / 1000 }
      else throw new Error()
    } catch (err) {
      return { success: false }
    }
  }
}
