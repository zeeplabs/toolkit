import { Buffer } from 'buffer'
import { clean } from '../diacritics'

/**
 * Encodes a string to Base64.
 *
 * This function takes a string and encodes it into a Base64 format using the Buffer class.
 *
 * @param {string} str - The string to be encoded.
 * @returns {string} - The Base64 encoded string.
 *
 * @example
 * // Encode a string to Base64
 * console.log(base64Encoding('Hello, World!')); // 'SGVsbG8sIFdvcmxkIQ=='
 */
export function base64Encoding(str: string): string {
  const buff = Buffer.from(str, 'utf-8')
  return buff.toString('base64')
}

/**
 * Decodes a Base64 string to its original form.
 *
 * This function takes a Base64 encoded string and decodes it back to the original string
 * using the Buffer class.
 *
 * @param {string} base64 - The Base64 encoded string to be decoded.
 * @returns {string} - The decoded string.
 *
 * @example
 * // Decode a Base64 string
 * console.log(base64Decoding('SGVsbG8sIFdvcmxkIQ==')); // 'Hello, World!'
 */
export function base64Decoding(base64: string): string {
  const buff = Buffer.from(base64, 'base64')
  return buff.toString('utf-8')
}

/**
 * Generates a random number between the given min and max values.
 *
 * ⚠️ Uses `Math.random()`, which is **not cryptographically secure** and is
 * predictable. Do not use this for tokens, verification codes, temporary
 * passwords, or any value with a security purpose — use the platform's
 * CSPRNG instead (e.g. `crypto.getRandomValues` in browsers/React Native,
 * `crypto.randomInt`/`crypto.randomBytes` in Node.js).
 *
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (inclusive).
 * @returns {number} - The generated random number.
 *
 * @example
 * console.log(generateRandomNumber(1, 10)); // Random number between 1 and 10
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generates a random string of a length between the given min and max values.
 *
 * ⚠️ Uses `Math.random()`, which is **not cryptographically secure** and is
 * predictable. Do not use this for tokens, verification codes, temporary
 * passwords, or any value with a security purpose — use the platform's
 * CSPRNG instead (e.g. `crypto.getRandomValues` in browsers/React Native,
 * `crypto.randomInt`/`crypto.randomBytes` in Node.js).
 *
 * @param {number} min - The minimum length of the generated string.
 * @param {number} max - The maximum length of the generated string.
 * @returns {string} - The generated random string.
 *
 * @example
 * console.log(generateRandomString(5, 10)); // Random string with length between 5 and 10
 */
export function generateRandomString(min: number, max: number): string {
  const length = Math.floor(Math.random() * (max - min + 1)) + min
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generates an array of numbers from 1 to the specified quantity.
 *
 * This function creates an array of sequential numbers starting from 1 up to the given quantity.
 *
 * @param {number} quantity - The number of elements in the generated array.
 * @returns {number[]} - An array of numbers from 1 to the specified quantity.
 *
 * @example
 * // Generate an array with numbers from 1 to 5
 * console.log(generateRange(5)); // [1, 2, 3, 4, 5]
 *
 * // Generate an array with numbers from 1 to 10
 * console.log(generateRange(10)); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 */
export function generateRange(quantity: number): number[] {
  return Array.from({ length: quantity }, (_, i) => i + 1)
}

/**
 * Creates a URL-friendly slug from a given string.
 *
 * This function takes a string, removes diacritics, converts it to lowercase, removes
 * non-word characters, and replaces spaces with hyphens.
 *
 * @param {string} name - The input string to be converted into a slug.
 * @returns {string} - The generated slug.
 *
 * @example
 * // Create slug from string
 * console.log(createSlug('Hello World!')); // 'hello-world'
 *
 * // Create slug from string with diacritics
 * console.log(createSlug('Olá Mundo!')); // 'ola-mundo'
 */
export function createSlug(name: string): string {
  let slug = clean(name) // Remove diacritics
  slug = slug.toLowerCase() // Convert to lowercase
  slug = slug.replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
  slug = slug.replace(/\s+/g, '-') // Replace spaces with hyphens
  slug = slug.replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
  slug = slug.replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens

  return slug
}

/**
 * Limits a string to a specified length.
 *
 * This function truncates the input string to the specified length. If the string is
 * already shorter than or equal to the limit, it returns the original string.
 *
 * @param {string} text - The input string to be truncated.
 * @param {number} limit - The maximum length of the output string.
 * @param {boolean} [addEllipsis=false] - Whether to add "..." at the end if the string is truncated.
 * @returns {string} - The truncated string.
 *
 * @example
 * // Limit string to 10 characters
 * console.log(limitString('Hello World', 10)); // 'Hello Worl'
 *
 * // Limit string to 10 characters with ellipsis
 * console.log(limitString('Hello World', 10, true)); // 'Hello W...'
 */
export function limitString(
  text: string,
  limit: number,
  addEllipsis: boolean = false
): string {
  if (text.length <= limit) {
    return text
  }

  const truncatedText = addEllipsis
    ? text.slice(0, limit - 3)
    : text.slice(0, limit)

  return addEllipsis ? truncatedText + '...' : truncatedText
}
export interface Option {
  value: string
  [key: string]: any
}

export interface OptionGroup {
  options: Option[]
}

/**
 * Finds the option with the lowest value in the option group.
 *
 * This function iterates through the options in the given option group and returns the option
 * with the lowest numeric value. If the option group is invalid or empty, it returns null.
 *
 * @param {OptionGroup} optionGroup - The group of options to search through.
 * @returns {Option | null} - The option with the lowest value or null if no valid option is found.
 *
 * @example
 * const options = {
 *   options: [
 *     { value: '10' },
 *     { value: '5' },
 *     { value: '20' }
 *   ]
 * };
 * console.log(findLowestValue(options)); // { value: '5' }
 */
export function findLowestValue(optionGroup: OptionGroup): Option | null {
  if (
    !optionGroup ||
    !optionGroup.options ||
    optionGroup.options.length === 0
  ) {
    return null
  }

  return optionGroup.options.reduce<Option | null>((lowest, option) => {
    const value = parseFloat(option.value)
    if (isNaN(value)) {
      return lowest
    }
    return value < (lowest ? parseFloat(lowest.value) : Number.MAX_VALUE)
      ? option
      : lowest
  }, null)
}

/**
 * Generates an array of time slots in 2-hour intervals for a 24-hour period.
 *
 * This function creates an array of objects representing time slots in 2-hour intervals
 * from 00:00 to 24:00. Each object contains an index, a key representing the time range,
 * and a value initialized to 0.
 *
 * @returns {Array<{ index: number; key: string; value: number }>} - The array of time slots.
 *
 * @example
 * console.log(generateTimeSlots());
 * // [
 * //   { index: 0, key: '00:00 - 02:00', value: 0 },
 * //   { index: 1, key: '02:00 - 04:00', value: 0 },
 * //   ...,
 * //   { index: 11, key: '22:00 - 00:00', value: 0 }
 * // ]
 */
export function generateTimeSlots(): {
  index: number
  key: string
  value: number
}[] {
  const times: { index: number; key: string; value: number }[] = []

  for (let i = 0; i < 24; i += 2) {
    let key = `${i.toString().padStart(2, '0')}:00 - ${(i + 2).toString().padStart(2, '0')}:00`
    if (i === 22) key = '22:00 - 00:00'

    times.push({
      index: i / 2,
      key,
      value: 0,
    })
  }

  return times
}

/**
 * Extracts the first and last name from a given name string.
 *
 * This function takes a full name string and returns a string containing the first
 * and last name. If the name contains only one word, it returns that word.
 * If the name is empty or null, it returns an empty string.
 *
 * @param {string} name - The full name string.
 * @returns {string} - A string with the first and last name, or just the first name if only one word is provided.
 *
 * @example
 * // Full name
 * console.log(createFirstAndLastName('John Doe')); // "John Doe"
 *
 * // Single name
 * console.log(createFirstAndLastName('John')); // "John"
 *
 * // Multiple names
 * console.log(createFirstAndLastName('John Michael Doe')); // "John Michael"
 *
 * // Empty name
 * console.log(createFirstAndLastName('')); // ""
 */
export function createFirstAndLastName(name: string): string {
  if (!name) return ''

  const splitName = name.trim().split(/\s+/)

  if (splitName.length > 1) {
    return `${splitName[0]} ${splitName[1]}`
  } else {
    return splitName[0]
  }
}

/**
 * Converts a distance from meters to kilometers, rounded to one decimal place.
 *
 * This function takes a distance in meters and converts it to kilometers,
 * rounding the result to one decimal place.
 *
 * @param {number} distance - The distance in meters.
 * @returns {number} - The distance in kilometers, rounded to one decimal place.
 *
 * @example
 * // Convert 1500 meters to kilometers
 * console.log(calculateDistanceInKm(1500)); // 1.5
 */
export function calculateDistanceInKm(distance: number): number {
  return parseFloat((distance / 1000).toFixed(1))
}

/**
 * Checks if an object is empty.
 *
 * @param {Object} obj - The input object.
 * @returns {boolean} - True if the object is empty, false otherwise.
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Rounds a number to two decimal places.
 *
 * @param {number} num - The input number.
 * @returns {number} - The rounded number.
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100
}

/**
 * Finds the maximum value in an array of numbers.
 *
 * @param {number[]} arr - The input array of numbers.
 * @returns {number} - The maximum value.
 */
export function findMax(arr: number[]): number {
  return Math.max(...arr)
}

/**
 * Finds the minimum value in an array of numbers.
 *
 * @param {number[]} arr - The input array of numbers.
 * @returns {number} - The minimum value.
 */
export function findMin(arr: number[]): number {
  return Math.min(...arr)
}

/**
 * Removes duplicates from an array.
 *
 * @param {Array} arr - The input array.
 * @returns {Array} - The array with duplicates removed.
 */
export function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param {string} str - The input string.
 * @returns {string} - The string with the first letter of each word capitalized.
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}
