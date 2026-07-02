import {
  cpfOrCnpjMask,
  brazilianZipcodeMask,
  brazilianTelephoneMask,
  globalCellphoneMask,
  clearMask,
} from '../lib/masks'

describe('cpfOrCnpjMask', () => {
  test('should apply CPF mask', () => {
    const result = cpfOrCnpjMask('12345678909')
    expect(result).toBe('123.456.789-09')
  })

  test('should apply CNPJ mask', () => {
    const result = cpfOrCnpjMask('12345678000195')
    expect(result).toBe('12.345.678/0001-95')
  })
})

describe('brazilianZipcodeMask', () => {
  test('should apply CEP mask', () => {
    const result = brazilianZipcodeMask('12345678')
    expect(result).toBe('12345-678')
  })
})

describe('brasilianTelephoneMask', () => {
  test('should apply telephone mask to 8-digit number', () => {
    const result = brazilianTelephoneMask('1123456789')
    expect(result).toBe('(11) 2345-6789')
  })

  test('should apply telephone mask to 9-digit number', () => {
    const result = brazilianTelephoneMask('11987654321')
    expect(result).toBe('(11) 98765-4321')
  })

  test('should progressively mask partial input while typing', () => {
    expect(brazilianTelephoneMask('1')).toBe('1')
    expect(brazilianTelephoneMask('11')).toBe('11')
    expect(brazilianTelephoneMask('112')).toBe('(11) 2')
    expect(brazilianTelephoneMask('1123456')).toBe('(11) 2345-6')
    expect(brazilianTelephoneMask('1198765')).toBe('(11) 9876-5')
  })
})

describe('globalCellphoneMask', () => {
  test('should mask a US phone number', () => {
    const result = globalCellphoneMask('US', '1234567890')
    expect(result).toBe('(123) 456-7890')
  })

  test('should mask a Brazilian phone number', () => {
    const result = globalCellphoneMask('BR', '11987654321')
    expect(result).toBe('(11) 98765-4321')
  })
})

describe('clearMask', () => {
  test('should clear mask from CPF', () => {
    const result = clearMask('123.456.789-09')
    expect(result).toBe('12345678909')
  })

  test('should clear mask from CNPJ', () => {
    const result = clearMask('12.345.678/0001-95')
    expect(result).toBe('12345678000195')
  })

  test('should clear mask from phone number', () => {
    const result = clearMask('+55 (21) 98765-4321')
    expect(result).toBe('5521987654321')
  })
})
