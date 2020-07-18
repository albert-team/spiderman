/**
 * Choose a random element from an array
 */
export function chooseRandom<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
