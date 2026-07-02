import { calculateAge, convertDateFormat } from '../lib/dates'

describe('calculateAge', () => {
  test('Calculate age from Date object', () => {
    const birthDate = new Date(1990, 0, 1)
    expect(calculateAge(birthDate)).toBe(34)
  })

  test('Calculate age from string', () => {
    const birthDateString = '1990-01-01'
    expect(calculateAge(birthDateString)).toBe(34)
  })

  test('Returns NaN for an unparseable date string', () => {
    expect(calculateAge('not-a-date')).toBeNaN()
  })

  test('Returns NaN for an invalid Date object', () => {
    expect(calculateAge(new Date('invalid'))).toBeNaN()
  })
})

describe('convertDateFormat', () => {
  test('Convert from "yyyy-mm-dd" to "dd/mm/yyyy"', () => {
    const date = '2023-06-27'
    expect(convertDateFormat(date)).toBe('27/06/2023')
  })

  test('Convert from "dd/mm/yyyy" to "yyyy-mm-dd"', () => {
    const date = '27/06/2023'
    expect(convertDateFormat(date)).toBe('2023-06-27')
  })
})
