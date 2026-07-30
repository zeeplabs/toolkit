import {
  cpfMask,
  cnpjMask,
  brazilianZipcodeMask,
  brazilianTelephoneMask,
  globalCellphoneMask,
  clearMask,
  cnpjClearMask,
} from '../lib/masks'

describe('cpfMask', () => {
  test('should apply CPF mask', () => {
    const result = cpfMask('12345678909')
    expect(result).toBe('123.456.789-09')
  })

  test('should progressively mask partial input while typing', () => {
    expect(cpfMask('1')).toBe('1')
    expect(cpfMask('123')).toBe('123')
    expect(cpfMask('1234')).toBe('123.4')
    expect(cpfMask('123456789')).toBe('123.456.789')
    expect(cpfMask('12345678909')).toBe('123.456.789-09')
  })
})

describe('cnpjMask', () => {
  test('should apply CNPJ mask to a numeric CNPJ', () => {
    const result = cnpjMask('12345678000195')
    expect(result).toBe('12.345.678/0001-95')
  })

  test('should apply CNPJ mask to an alphanumeric CNPJ', () => {
    const result = cnpjMask('12ABC34501DE35')
    expect(result).toBe('12.ABC.345/01DE-35')
  })

  test('should uppercase lowercase letters', () => {
    const result = cnpjMask('12abc34501de35')
    expect(result).toBe('12.ABC.345/01DE-35')
  })

  test('should progressively mask partial alphanumeric input while typing', () => {
    expect(cnpjMask('1')).toBe('1')
    expect(cnpjMask('12')).toBe('12')
    expect(cnpjMask('12A')).toBe('12.A')
    expect(cnpjMask('12AB')).toBe('12.AB')
    expect(cnpjMask('12ABC')).toBe('12.ABC')
    expect(cnpjMask('12ABC3')).toBe('12.ABC.3')
    expect(cnpjMask('12ABC34')).toBe('12.ABC.34')
    expect(cnpjMask('12ABC345')).toBe('12.ABC.345')
    expect(cnpjMask('12ABC3450')).toBe('12.ABC.345/0')
    expect(cnpjMask('12ABC34501')).toBe('12.ABC.345/01')
    expect(cnpjMask('12ABC34501D')).toBe('12.ABC.345/01D')
    expect(cnpjMask('12ABC34501DE')).toBe('12.ABC.345/01DE')
    expect(cnpjMask('12ABC34501DE3')).toBe('12.ABC.345/01DE-3')
    expect(cnpjMask('12ABC34501DE35')).toBe('12.ABC.345/01DE-35')
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

describe('cnpjClearMask', () => {
  test('should clear mask from an alphanumeric CNPJ', () => {
    const result = cnpjClearMask('12.ABC.345/01DE-35')
    expect(result).toBe('12ABC34501DE35')
  })

  test('should clear mask from a numeric CNPJ', () => {
    const result = cnpjClearMask('12.345.678/0001-95')
    expect(result).toBe('12345678000195')
  })

  test('should uppercase lowercase letters', () => {
    const result = cnpjClearMask('12.abc.345/01de-35')
    expect(result).toBe('12ABC34501DE35')
  })

  test('should round-trip with cnpjMask', () => {
    const raw = '12ABC34501DE35'
    expect(cnpjClearMask(cnpjMask(raw))).toBe(raw)
  })
})
