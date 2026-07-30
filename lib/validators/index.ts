/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas).
 *
 * The CPF is a unique identifier for Brazilian individuals, and it follows a specific format
 * with 11 digits. This function checks the validity of a given CPF string by verifying its
 * length, ensuring it doesn't consist of repeated digits, and calculating its verification digits.
 *
 * @param {string} value - The CPF string to be validated. It can contain non-digit characters
 *                         which will be removed during validation.
 * @returns {boolean} - Returns true if the CPF is valid, otherwise false.
 *
 * @example
 * // Valid CPF
 * console.log(cpfValidator('123.456.789-09')); // true
 *
 * // Invalid CPF
 * console.log(cpfValidator('123.456.789-00')); // false
 */
export function cpfValidator(value: string): boolean {
  const cpf = value.replace(/\D/g, '')

  if (cpf.length !== 11) return false

  if (/^(\d)\1+$/.test(cpf)) return false

  const calculateDigit = (cpf: string, factor: number): number => {
    let sum = 0
    for (let i = 0; i < cpf.length; i++) {
      sum += parseInt(cpf.charAt(i)) * factor--
    }
    const result = sum % 11
    return result < 2 ? 0 : 11 - result
  }

  const firstNineDigits = cpf.substring(0, 9)
  const firstDigit = calculateDigit(firstNineDigits, 10)
  if (firstDigit !== parseInt(cpf.charAt(9))) return false

  const firstTenDigits = cpf.substring(0, 10)
  const secondDigit = calculateDigit(firstTenDigits, 11)
  if (secondDigit !== parseInt(cpf.charAt(10))) return false

  return true
}

/**
 * Validates a Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica).
 *
 * The CNPJ is a unique identifier for Brazilian companies. This function validates both
 * the legacy all-numeric format and the alphanumeric format introduced by the Receita
 * Federal (effective 2026-07-31, Nota Técnica COCAD/SUARA/RFB nº 49/2024): positions 1-12
 * (root + order) may be digits (0-9) or uppercase letters (A-Z), while positions 13-14
 * (check digits) are always numeric. Input is normalized to uppercase and non-alphanumeric
 * characters are stripped before validation, so masked or lowercase input is accepted.
 *
 * @param {string} value - The CNPJ string to be validated. May contain mask punctuation
 *                         (`.`, `/`, `-`) and lowercase letters, which are normalized away.
 * @returns {boolean} - Returns true if the CNPJ is valid, otherwise false.
 *
 * @example
 * // Valid numeric CNPJ
 * console.log(cnpjValidator('12.345.678/0001-95')); // true
 *
 * // Valid alphanumeric CNPJ
 * console.log(cnpjValidator('12.ABC.345/01DE-35')); // true
 *
 * // Invalid CNPJ
 * console.log(cnpjValidator('12.345.678/0001-96')); // false
 */
export function cnpjValidator(value: string): boolean {
  const cnpj = value.toUpperCase().replace(/[^0-9A-Z]/g, '')

  if (cnpj.length !== 14) return false

  if (/^(.)\1+$/.test(cnpj)) return false

  if (!/^[0-9]{2}$/.test(cnpj.slice(12))) return false

  const charValue = (char: string): number => char.charCodeAt(0) - 48

  const calculateDigit = (base: string, weights: number[]): number => {
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += charValue(base.charAt(i)) * weights[i]
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const base12 = cnpj.substring(0, 12)
  const digit1 = calculateDigit(base12, weights1)
  const digit2 = calculateDigit(base12 + digit1, weights2)

  return (
    digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13))
  )
}

/**
 * Validates an email address using a regular expression.
 *
 * This function checks the validity of a given email string by matching it
 * against a regular expression that covers common email formats.
 *
 * @param {string} email - The email string to be validated.
 * @returns {boolean} - Returns true if the email is valid, otherwise false.
 *
 * @example
 * // Valid email
 * console.log(emailValidation('example@example.com')); // true
 *
 * // Invalid email
 * console.log(emailValidation('example@com')); // false
 */
export const emailIsValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[A-Za-z]{2,24}$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Checks if a name string is valid.
 *
 * This function verifies if the given name string is valid by checking three conditions:
 * 1. The last character should not be a space.
 * 2. The name should contain at least two words.
 * 3. The name should not be empty.
 *
 * @param {string} name - The name string to be validated.
 * @returns {boolean} - True if the name is valid, otherwise false.
 *
 * @example
 * // Valid name
 * console.log(nameIsValid('John Doe')); // true
 *
 * // Invalid name (last character is space)
 * console.log(nameIsValid('John ')); // false
 *
 * // Invalid name (only one word)
 * console.log(nameIsValid('John')); // false
 *
 * // Invalid name (empty string)
 * console.log(nameIsValid('')); // false
 */
export const nameIsValid = (name: string): boolean => {
  const lastCharacterIsEmpty = name.endsWith(' ')
  const nameIsIncomplete = name.trim().split(' ').length < 2
  const nameIsEmpty = name.length === 0

  return !(lastCharacterIsEmpty || nameIsIncomplete || nameIsEmpty)
}

export interface ValidationResult {
  valid: boolean
  message: string
}

// Accented Latin letters, excluding the U+00D7 (×) and U+00F7 (÷) symbols
// that fall inside the naive À-ÿ range but are not letters.
const ACCENTED_LETTER_RANGE = 'A-Za-zÀ-ÖØ-öø-ÿ'

/**
 * Validates a full name string to ensure it has at least a first name and a last name,
 * contains only alphabetic characters (optionally hyphenated or with apostrophes, e.g.
 * "Mary-Jane" or "O'Connor"), and does not have multiple consecutive spaces.
 *
 * Uses the same accepted character set as `validNameAndLastName` — the two functions
 * differ in return shape (`ValidationResult` with a message here, plain `boolean`
 * there) and in exactly how they split/require name parts, not in what counts as a
 * valid name character.
 *
 * @param {string} name - The full name string to validate.
 * @returns {ValidationResult} - An object indicating if the name is valid and an error message if not.
 *
 * @example
 * // Valid full name
 * console.log(fullnameValidation('John Doe')); // { valid: true, message: '' }
 *
 * // Valid full name with hyphen and apostrophe
 * console.log(fullnameValidation("Mary-Jane O'Connor")); // { valid: true, message: '' }
 *
 * // Invalid full name (extra spaces)
 * console.log(fullnameValidation('John  Doe')); // { valid: false, message: 'No extra spaces allowed' }
 *
 * // Invalid full name (single name)
 * console.log(fullnameValidation('John')); // { valid: false, message: 'Name should include first and last name' }
 *
 * // Invalid full name (non-alphabetic characters)
 * console.log(fullnameValidation('John Doe1')); // { valid: false, message: 'Only alphabetic characters are allowed' }
 */
export function fullnameIsValid(name: string): ValidationResult {
  const nameTrimmed = name.trim()

  if (/\s{2,}/.test(nameTrimmed)) {
    return {
      valid: false,
      message: 'No extra spaces allowed',
    }
  }

  const nameParts = nameTrimmed.split(' ')

  if (nameParts.length < 2) {
    return {
      valid: false,
      message: 'Name should include first and last name',
    }
  }

  const namePartRegex = new RegExp(`^[${ACCENTED_LETTER_RANGE}'-]+$`)
  for (const part of nameParts) {
    if (!namePartRegex.test(part)) {
      return {
        valid: false,
        message: 'Only alphabetic characters are allowed',
      }
    }
  }

  return {
    valid: true,
    message: '',
  }
}

/**
 * Validates if the given string contains a valid first name and last name.
 *
 * This function checks if the given name string consists of a valid first name and last name,
 * allowing for spaces, hyphens, and apostrophes.
 *
 * Uses the same accepted character set as `fullnameIsValid`.
 *
 * @param {string} name - The name string to be validated.
 * @returns {boolean} - True if the name is valid, otherwise false.
 *
 * @example
 * // Valid name
 * console.log(validNameAndLastName('John Doe')); // true
 *
 * // Invalid name (only first name)
 * console.log(validNameAndLastName('John')); // false
 *
 * // Valid name with hyphen
 * console.log(validNameAndLastName('Mary-Jane Smith')); // true
 *
 * // Valid name with apostrophe
 * console.log(validNameAndLastName("O'Connor")); // true
 */
export const validNameAndLastName = (name: string): boolean => {
  const regex = new RegExp(
    `^[${ACCENTED_LETTER_RANGE}]+([-\\s'][${ACCENTED_LETTER_RANGE}]+)+$`
  )
  return regex.test(name)
}

/**
 * Validates a Brazilian telephone number using a regular expression.
 *
 * This function checks the validity of a given telephone string by matching it
 * against a regular expression that covers common telephone formats in Brazil.
 *
 * @param {string} telephone - The telephone string to be validated.
 * @returns {boolean} - Returns true if the telephone number is valid, otherwise false.
 *
 * @example
 * // Valid telephone numbers
 * console.log(telephoneValidator('+55 (21) 98765-4321')); // true
 * console.log(telephoneValidator('021987654321')); // true
 *
 * // Invalid telephone numbers
 * console.log(telephoneValidator('123456')); // false
 * console.log(telephoneValidator('abcd-efgh')); // false
 */
export function brazilianTelephoneValidator(telephone: string): boolean {
  const telephoneRegex =
    /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})-?(\d{4}))$/
  return telephoneRegex.test(telephone)
}

/**
 * Checks if the given birthdate corresponds to an age of 18 or older.
 *
 * This function validates the given birthdate string and checks if the age is 18 or older,
 * considering the current date. It supports birthdate formats 'YYYY-MM-DD' and 'DD/MM/YYYY'.
 *
 * This function never throws. Any unparseable or invalid birthdate (wrong
 * separator, non-numeric parts, or an out-of-range day/month such as
 * '31/02/2000') returns `false`.
 *
 * @param {string} birthday - The birthdate string in 'YYYY-MM-DD' or 'DD/MM/YYYY' format.
 * @param {boolean} allowMinors - Flag to allow minors (under 18).
 * @returns {boolean} - True if the age is 18 or older, otherwise false.
 *
 * @example
 * // Check if a birthdate is 18 or older in 'YYYY-MM-DD' format
 * console.log(birthdateIs18Plus('2000-01-01', false)); // true or false depending on the current date
 *
 * // Check if a birthdate is 18 or older in 'DD/MM/YYYY' format
 * console.log(birthdateIs18Plus('01/01/2000', false)); // true or false depending on the current date
 *
 * // Invalid date
 * console.log(birthdateIs18Plus('31/02/2000', false)); // false
 */
export const birthdateIs18Plus = (
  birthday: string,
  allowMinors: boolean
): boolean => {
  let day: number, month: number, year: number

  if (birthday.includes('-')) {
    // Format 'YYYY-MM-DD'
    ;[year, month, day] = birthday.split('-').map(Number)
  } else if (birthday.includes('/')) {
    // Format 'DD/MM/YYYY'
    ;[day, month, year] = birthday.split('/').map(Number)
  } else {
    // Invalid format
    return false
  }

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return false
  }

  const birthDate = new Date(year, month - 1, day)

  // Date rolls over invalid components (e.g. 31/02) instead of throwing —
  // reject anything that doesn't round-trip back to the same day/month/year.
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return false
  }

  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  const dayDifference = today.getDate() - birthDate.getDate()

  const is18OrOlder =
    age > 18 ||
    (age === 18 &&
      (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)))

  if (allowMinors) {
    return age >= 0 && age < 105
  }

  return is18OrOlder && age < 105
}

export interface PasswordPayload {
  passwordIsValid: boolean
  errors?: string[]
}

export interface PasswordValidatorOptions {
  requireSpecialChar?: boolean
  maxLength?: number
}

const DEFAULT_PASSWORD_MAX_LENGTH = 128

/**
 * Validates a password based on specific security criteria.
 *
 * This function checks if the given password meets the following criteria:
 * - At least 8 characters long
 * - No longer than `maxLength` (defaults to 128), to avoid excessive-length
 *   inputs being passed downstream to hashing functions
 * - Contains at least one number
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one special character, when `requireSpecialChar` is enabled
 *
 * @param {string} password - The password string to be validated.
 * @param {PasswordValidatorOptions} [options] - Optional validation configuration.
 * @param {boolean} [options.requireSpecialChar=false] - Whether a special character is required.
 * @param {number} [options.maxLength=128] - Maximum allowed password length.
 * @returns {PasswordPayload} - An object indicating if the password is valid and any validation errors.
 *
 * @example
 * // Valid password
 * console.log(passwordStrongValidator('StrongP@ssword1')); // { passwordIsValid: true }
 *
 * // Invalid password
 * console.log(passwordStrongValidator('weak')); // { passwordIsValid: false, errors: ['passwordLength', 'noNumber', 'noUpperCaseLetter'] }
 *
 * // Requiring a special character
 * console.log(passwordStrongValidator('StrongPassword1', { requireSpecialChar: true }));
 * // { passwordIsValid: false, errors: ['noSpecialChar'] }
 */
export function passwordStrongValidator(
  password: string,
  options?: PasswordValidatorOptions
): PasswordPayload {
  const requireSpecialChar = options?.requireSpecialChar ?? false
  const maxLength = options?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH

  const passwordLength = password.length >= 8
  const passwordExceedsMaxLength = password.length > maxLength
  const passwordHasNumber = /(?=.*[0-9])/.test(password)
  const passwordHasUpperCaseLetter = /(?=.*[A-Z])/.test(password)
  const passwordHasLowerCaseLetter = /(?=.*[a-z])/.test(password)
  const passwordHasSpecialChar = /(?=.*[^A-Za-z0-9])/.test(password)

  const errors: string[] = []

  if (!passwordLength) errors.push('passwordLength')
  if (passwordExceedsMaxLength) errors.push('passwordTooLong')
  if (!passwordHasNumber) errors.push('noNumber')
  if (!passwordHasUpperCaseLetter) errors.push('noUpperCaseLetter')
  if (!passwordHasLowerCaseLetter) errors.push('noLowerCaseLetter')
  if (requireSpecialChar && !passwordHasSpecialChar) errors.push('noSpecialChar')

  if (errors.length) {
    return { passwordIsValid: false, errors }
  }

  return { passwordIsValid: true }
}
