import { countries } from '../utils/countries'

/**
 * Applies a CPF mask to a string.
 *
 * Formats the input as a CPF (xxx.xxx.xxx-xx). Formats progressively as digits are
 * typed — it does not require the full number to be present, so it can be used directly
 * in an input's `onChange`.
 *
 * @param {string} value - The value to be formatted, containing only digits.
 * @returns {string} - The formatted value with the CPF mask applied.
 *
 * @example
 * console.log(cpfMask('12345678909')); // '123.456.789-09'
 */
export function cpfMask(value: string): string {
  value = value.replace(/\D/g, '')

  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d)/, '$1.$2')
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  return value
}

/**
 * Applies a CNPJ mask to a string.
 *
 * Formats the input as a CNPJ (xx.xxx.xxx/xxxx-xx). Accepts both the legacy all-numeric
 * CNPJ and the alphanumeric format introduced by the Receita Federal (effective
 * 2026-07-31): letters are allowed in the first 12 characters (root + order), the last two
 * (check digits) stay numeric. Input is uppercased internally, so lowercase letters are
 * accepted. Formats progressively as characters are typed — it does not require the full
 * value to be present, so it can be used directly in an input's `onChange`.
 *
 * @param {string} value - The value to be formatted, containing digits and/or letters.
 * @returns {string} - The formatted value with the CNPJ mask applied.
 *
 * @example
 * console.log(cnpjMask('12345678000195')); // '12.345.678/0001-95'
 * console.log(cnpjMask('12ABC34501DE35')); // '12.ABC.345/01DE-35'
 */
export function cnpjMask(value: string): string {
  value = value.toUpperCase().replace(/[^0-9A-Z]/g, '')

  value = value.replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
  value = value.replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
  value = value.replace(/\.([0-9A-Z]{3})([0-9A-Z])/, '.$1/$2')
  value = value.replace(/([0-9A-Z]{4})(\d)/, '$1-$2')

  return value
}

/**
 * Applies a mask to a Brazilian CEP (Postal Code).
 *
 * This function formats the input value as a CEP (xxxxx-xxx) by removing any non-digit characters
 * and applying the appropriate mask.
 *
 * @param {string} value - The value to be formatted, containing only digits.
 * @returns {string} - The formatted value with CEP mask applied.
 *
 * @example
 * // Apply CEP mask
 * console.log(cepMask('12345678')); // '12345-678'
 */
export function brazilianZipcodeMask(value: string): string {
  value = value.replace(/\D/g, '')
  value = value.replace(/^(\d{5})(\d)/, '$1-$2')

  return value
}

/**
 * Applies a mask to a Brazilian telephone number.
 *
 * This function formats the input value as a Brazilian telephone number, handling
 * both 8-digit and 9-digit phone numbers correctly. Like `cpfMask` and `cnpjMask`, it
 * formats progressively as digits are typed — it does not require the full
 * number to be present, so it can be used directly in an input's `onChange`.
 *
 * @param {string} value - The value to be formatted, containing only digits.
 * @returns {string} - The formatted telephone number.
 *
 * @example
 * // Apply telephone mask to 8-digit number
 * console.log(telephoneMask('1123456789')); // '(11) 2345-6789'
 *
 * // Apply telephone mask to 9-digit number
 * console.log(telephoneMask('11987654321')); // '(11) 98765-4321'
 *
 * // Partial input while typing
 * console.log(telephoneMask('1198765')); // '(11) 9876-5'
 */
export function brazilianTelephoneMask(value: string): string {
  value = value.replace(/\D/g, '')

  if (value.length <= 10) {
    value = value.replace(/^(\d{2})(\d)/, '($1) $2')
    value = value.replace(/(\d{4})(\d)/, '$1-$2')
  } else {
    value = value.replace(/^(\d{2})(\d)/, '($1) $2')
    value = value.replace(/(\d{5})(\d)/, '$1-$2')
  }

  return value
}

/**
 * Applies a mask to a phone number based on the country code.
 *
 * This function finds the appropriate mask for the given country code and applies it
 * to the provided phone number. If no mask is found for the country, the original
 * phone number is returned.
 *
 * @param {string} country - The country code (e.g., 'US', 'BR').
 * @param {string} phoneNumber - The phone number to be masked.
 * @returns {string} - The masked phone number.
 *
 * @example
 * // Mask a US phone number
 * console.log(cellphoneMask('US', '1234567890')); // '(123) 456-7890'
 *
 * // Mask a Brazilian phone number
 * console.log(cellphoneMask('BR', '11987654321')); // '(11) 98765-4321'
 */
export const globalCellphoneMask = (
  country: string,
  phoneNumber: string
): string => {
  const selectCountry = countries.find((item) => item.code === country)
  const mask = selectCountry?.mask
  if (!mask) {
    return phoneNumber
  }

  const digits = phoneNumber.replace(/\D/g, '')
  let result = ''
  let digitIndex = 0

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === '9') {
      result += digits[digitIndex++]
    } else {
      result += mask[i]
    }
  }

  return result
}

/**
 * Removes all non-digit characters from the input string.
 *
 * This function is used to clear any mask or formatting from a string,
 * leaving only the numeric characters.
 *
 * @param {string} value - The string from which to remove non-digit characters.
 * @returns {string} - The cleaned string containing only digits.
 *
 * @example
 * // Clear mask from CPF
 * console.log(clearMask('123.456.789-09')); // '12345678909'
 *
 * // Clear mask from CNPJ
 * console.log(clearMask('12.345.678/0001-95')); // '12345678000195'
 *
 * // Clear mask from phone number
 * console.log(clearMask('+55 (21) 98765-4321')); // '5521987654321'
 */
export function clearMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Removes CNPJ mask punctuation while preserving letters, for the alphanumeric CNPJ format.
 *
 * Unlike `clearMask` (which strips everything but digits, for CPF/phone/CEP), this keeps
 * letters intact — stripping only `clearMask` would destroy an alphanumeric CNPJ's root/order
 * characters. Uppercases the result, so it round-trips with `cnpjMask`'s output regardless of
 * input case.
 *
 * @param {string} value - The masked CNPJ string, e.g. `'12.ABC.345/01DE-35'`.
 * @returns {string} - The unmasked value with letters preserved, e.g. `'12ABC34501DE35'`.
 *
 * @example
 * console.log(cnpjClearMask('12.ABC.345/01DE-35')); // '12ABC34501DE35'
 * console.log(cnpjClearMask('12.345.678/0001-95')); // '12345678000195'
 */
export function cnpjClearMask(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '')
}
