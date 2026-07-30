import {
  cpfValidator,
  cnpjValidator,
  emailIsValid,
  nameIsValid,
  fullnameIsValid,
  validNameAndLastName,
  brazilianTelephoneValidator,
  birthdateIs18Plus,
  passwordStrongValidator,
} from '../lib/validators'

describe('cpfValidator', () => {
  test('Valid CPF', () => {
    expect(cpfValidator('123.456.789-09')).toBe(true)
  })

  test('Invalid CPF', () => {
    expect(cpfValidator('123.456.789-00')).toBe(false)
  })
})

describe('cnpjValidator', () => {
  test('Valid numeric CNPJ', () => {
    expect(cnpjValidator('12.345.678/0001-95')).toBe(true)
  })

  test('Invalid numeric CNPJ (wrong check digit)', () => {
    expect(cnpjValidator('12.345.678/0001-96')).toBe(false)
  })

  test('Valid alphanumeric CNPJ', () => {
    expect(cnpjValidator('12.ABC.345/01DE-35')).toBe(true)
  })

  test('Valid alphanumeric CNPJ, lowercase letters normalized', () => {
    expect(cnpjValidator('12.abc.345/01de-35')).toBe(true)
  })

  test('Invalid alphanumeric CNPJ (wrong check digit)', () => {
    expect(cnpjValidator('12.ABC.345/01DE-36')).toBe(false)
  })

  test('Invalid CNPJ when a check digit position holds a letter', () => {
    expect(cnpjValidator('12.ABC.345/01DE-3F')).toBe(false)
  })

  test('Invalid CNPJ with all repeated characters', () => {
    expect(cnpjValidator('AA.AAA.AAA/AAAA-AA')).toBe(false)
  })

  test('Invalid CNPJ with wrong length', () => {
    expect(cnpjValidator('12.ABC.345/01DE')).toBe(false)
  })
})

describe('emailIsValid', () => {
  test('Valid email', () => {
    expect(emailIsValid('example@example.com')).toBe(true)
  })

  test('Invalid email', () => {
    expect(emailIsValid('example@com')).toBe(false)
  })
})

describe('nameIsValid', () => {
  test('valid name', () => {
    expect(nameIsValid('John Doe')).toBe(true)
  })

  test('invalid name (last character is space)', () => {
    expect(nameIsValid('John ')).toBe(false)
  })

  test('invalid name (only one word)', () => {
    expect(nameIsValid('John')).toBe(false)
  })

  test('invalid name (empty string)', () => {
    expect(nameIsValid('')).toBe(false)
  })
})

describe('fullnameIsValid', () => {
  test('valid full name', () => {
    expect(fullnameIsValid('John Doe')).toEqual({ valid: true, message: '' })
  })

  test('invalid full name (extra spaces)', () => {
    expect(fullnameIsValid('John  Doe')).toEqual({
      valid: false,
      message: 'No extra spaces allowed',
    })
  })

  test('invalid full name (single name)', () => {
    expect(fullnameIsValid('John')).toEqual({
      valid: false,
      message: 'Name should include first and last name',
    })
  })

  test('invalid full name (non-alphabetic characters)', () => {
    expect(fullnameIsValid('John Doe1')).toEqual({
      valid: false,
      message: 'Only alphabetic characters are allowed',
    })
  })

  test('valid full name with hyphenated first name', () => {
    expect(fullnameIsValid('Mary-Jane Smith')).toEqual({
      valid: true,
      message: '',
    })
  })

  test('valid full name with apostrophe', () => {
    expect(fullnameIsValid("O'Connor Smith")).toEqual({
      valid: true,
      message: '',
    })
  })

  test('invalid full name (multiplication sign is not a letter)', () => {
    expect(fullnameIsValid('John Doe×')).toEqual({
      valid: false,
      message: 'Only alphabetic characters are allowed',
    })
  })
})

describe('validNameAndLastName', () => {
  test('valid name', () => {
    expect(validNameAndLastName('John Doe')).toBe(true)
  })

  test('invalid name (only first name)', () => {
    expect(validNameAndLastName('John')).toBe(false)
  })

  test('valid name with hyphen', () => {
    expect(validNameAndLastName('Mary-Jane Smith')).toBe(true)
  })

  test('valid name with apostrophe', () => {
    expect(validNameAndLastName("O'Connor")).toBe(true)
  })

  test('rejects multiplication/division signs (not letters)', () => {
    expect(validNameAndLastName('John Doe×')).toBe(false)
    expect(validNameAndLastName('John Doe÷')).toBe(false)
  })
})

describe('brazilianTelephoneValidator', () => {
  test('valid telephone numbers', () => {
    expect(brazilianTelephoneValidator('+55 (21) 98765-4321')).toBe(true)
  })

  test('invalid telephone numbers', () => {
    expect(brazilianTelephoneValidator('123456')).toBe(false)
    expect(brazilianTelephoneValidator('abcd-efgh')).toBe(false)
  })
})

describe('birthdateIs18Plus', () => {
  test('check if a birthdate is 18 or older', () => {
    const currentDate = new Date()
    const eighteenYearsAgo = new Date()
    eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18)

    const birthDateString = `${eighteenYearsAgo.getFullYear()}-${String(
      eighteenYearsAgo.getMonth() + 1
    ).padStart(2, '0')}-${String(eighteenYearsAgo.getDate()).padStart(2, '0')}`

    expect(birthdateIs18Plus(birthDateString, false)).toBe(true)
  })

  test('allow minors', () => {
    expect(birthdateIs18Plus('2010-01-01', true)).toBe(true)
  })

  test('disallow minors', () => {
    expect(birthdateIs18Plus('2010-01-01', false)).toBe(false)
  })

  test('rejects a birthdate with an out-of-range day (rollover)', () => {
    expect(birthdateIs18Plus('31/02/2000', false)).toBe(false)
  })

  test('rejects a birthdate with non-numeric parts', () => {
    expect(birthdateIs18Plus('aa/bb/cccc', false)).toBe(false)
  })

  test('rejects an unrecognized format', () => {
    expect(birthdateIs18Plus('2000.01.01', false)).toBe(false)
  })
})

describe('passwordStrongValidator', () => {
  test('valid password', () => {
    expect(passwordStrongValidator('StrongP@ssword1')).toEqual({
      passwordIsValid: true,
    })
  })

  test('special character not required by default', () => {
    expect(passwordStrongValidator('StrongPassword1')).toEqual({
      passwordIsValid: true,
    })
  })

  test('requires special character when requireSpecialChar is enabled', () => {
    expect(
      passwordStrongValidator('StrongPassword1', { requireSpecialChar: true })
    ).toEqual({
      passwordIsValid: false,
      errors: ['noSpecialChar'],
    })
  })

  test('accepts special character when requireSpecialChar is enabled', () => {
    expect(
      passwordStrongValidator('StrongP@ssword1', { requireSpecialChar: true })
    ).toEqual({
      passwordIsValid: true,
    })
  })

  test('rejects password longer than default max length', () => {
    const tooLong = `Aa1${'a'.repeat(126)}`
    expect(passwordStrongValidator(tooLong)).toEqual({
      passwordIsValid: false,
      errors: ['passwordTooLong'],
    })
  })

  test('rejects password longer than custom max length', () => {
    expect(
      passwordStrongValidator('StrongP@ssword1', { maxLength: 10 })
    ).toEqual({
      passwordIsValid: false,
      errors: ['passwordTooLong'],
    })
  })
})
