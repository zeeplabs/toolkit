/**
 * Formats a given amount as Brazilian Real currency.
 *
 * This function takes a number or a string that can be parsed to a number,
 * formats it to two decimal places, and converts it to Brazilian Real currency format.
 *
 * @param {number | string} [amount=0] - The amount to be formatted. Defaults to 0 if not provided.
 * @returns {string} - The formatted currency string in Brazilian Real.
 *
 * @example
 * // Format number to BRL currency
 * console.log(formatReal(1234.56)); // 'R$ 1.234,56'
 *
 * // Format string to BRL currency
 * console.log(formatReal('1234.56')); // 'R$ 1.234,56'
 *
 * // Handle undefined input
 * console.log(formatReal()); // 'R$ 0,00'
 */
export const formatReal = (amount: number | string = 0): string => {
  const number = Number(amount) || 0
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Rounds the given number to the nearest integer.
 *
 * BREAKING CHANGE: prior versions treated the literal number `-1` as a
 * sentinel meaning "no value" and returned `0` for it, silently discarding
 * any real `-1` input. That sentinel has been removed — `-1` now rounds to
 * `-1` like any other number. Pass `null` or `undefined` to explicitly
 * request the "no value" fallback of `0`.
 *
 * @param {number | null} [value] - The number to be rounded.
 * @returns {number} - The rounded number, or 0 if `value` is `null`/`undefined`.
 *
 * @example
 * // Round a number
 * console.log(formatRound(4.567)); // 5
 *
 * // No value
 * console.log(formatRound(null)); // 0
 *
 * // A real -1 is no longer zeroed out
 * console.log(formatRound(-1)); // -1
 */
export const formatRound = (value?: number | null): number => {
  if (value == null) {
    return 0
  }

  return Math.round(value)
}

/**
 * Formats the given number to a string with two decimal places.
 *
 * BREAKING CHANGE: prior versions treated the literal number `-1` as a
 * sentinel meaning "no value" and returned `"0,00"` for it, silently
 * discarding any real `-1` input. That sentinel has been removed — `-1`
 * now formats as `"-1,00"` like any other number. Pass `null` or
 * `undefined` to explicitly request the "no value" fallback of `"0,00"`.
 *
 * @param {number | null} [value] - The number to be formatted.
 * @returns {string} - The formatted number as a string with two decimal places.
 *
 * @example
 * // Format a number to two decimal places
 * console.log(formatDecimal(1234.56)); // "1234,56"
 *
 * // No value
 * console.log(formatDecimal(null)); // "0,00"
 *
 * // A real -1 is no longer zeroed out
 * console.log(formatDecimal(-1)); // "-1,00"
 */
export const formatDecimal = (value?: number | null): string => {
  if (value == null) {
    return '0,00'
  }

  return value.toFixed(2).replace('.', ',')
}
