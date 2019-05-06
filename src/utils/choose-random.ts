/**
 * Choose a random element from an array
 */
export default function<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
