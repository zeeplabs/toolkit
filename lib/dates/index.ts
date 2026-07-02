/**
 * Calculates the age of a person based on a given birth date.
 *
 * This function accepts a birth date in the form of a Date object or a string,
 * converts it to a Date object if necessary, and calculates the age in years.
 *
 * This function never throws. If `birthDate` cannot be parsed into a valid
 * date, it returns `NaN` instead of a number of years.
 *
 * @param {Date | string} birthDate - The birth date of the person.
 * @returns {number} - The age of the person in years, or `NaN` if `birthDate` is invalid.
 *
 * @example
 * // Calculate age from Date object
 * console.log(calculateAge(new Date(1990, 0, 1))); // e.g., 34
 *
 * // Calculate age from string
 * console.log(calculateAge('1990-01-01')); // e.g., 34
 *
 * // Invalid input
 * console.log(calculateAge('not-a-date')); // NaN
 */
export function calculateAge(birthDate: Date | string): number {
  const dateOfBirth =
    typeof birthDate === 'string' ? new Date(birthDate) : birthDate

  if (isNaN(dateOfBirth.getTime())) {
    return NaN
  }

  const today = new Date()

  let age = today.getFullYear() - dateOfBirth.getFullYear()

  const monthDifference = today.getMonth() - dateOfBirth.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--
  }

  return age
}

/**
 * Converts a date from 'yyyy-mm-dd' format to 'dd/mm/yyyy' format and vice versa.
 *
 * @param {string} date - The date string to be converted.
 * @returns {string} - The converted date string.
 *
 * @example
 * // Convert from 'yyyy-mm-dd' to 'dd/mm/yyyy'
 * console.log(convertDateFormat('2023-06-27')); // "27/06/2023"
 *
 * // Convert from 'dd/mm/yyyy' to 'yyyy-mm-dd'
 * console.log(convertDateFormat('27/06/2023')); // "2023-06-27"
 */
export function convertDateFormat(date: string): string {
  // Check if the input is in 'yyyy-mm-dd' format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  }

  // Check if the input is in 'dd/mm/yyyy' format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split('/')
    return `${year}-${month}-${day}`
  }

  throw new Error(
    'Invalid date format. Expected formats are yyyy-mm-dd or dd/mm/yyyy.'
  )
}
