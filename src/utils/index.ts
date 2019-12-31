/**
 * Choose a random element from an array
 */
const chooseRandom = <T>(arr: Array<T>): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export { chooseRandom }
