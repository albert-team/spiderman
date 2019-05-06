/**
 * Wait for a period of time
 */
export default async function wait(ms: number) {
  return new Promise((done) => setTimeout(done, ms))
}
