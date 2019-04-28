/**
 * Wait for a period of time
 */
export default async function(ms: number) {
  return new Promise((done) => setTimeout(done, ms))
}
