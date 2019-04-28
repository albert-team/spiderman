/**
 * Choose a random element from an array
 */
export default function(arr: any[]): any {
  return arr[Math.floor(Math.random() * arr.length)]
}
