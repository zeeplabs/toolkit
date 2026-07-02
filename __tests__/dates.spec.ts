import { calculateAge, convertDateFormat } from '../lib/dates'

describe('calculateAge', () => {
  const AGE_YEARS = 34
  const today = new Date()
  const birthDate = new Date(
    today.getFullYear() - AGE_YEARS,
    today.getMonth(),
    today.getDate()
  )

  test('Calculate age from Date object', () => {
    expect(calculateAge(birthDate)).toBe(AGE_YEARS)
  })

  test('Calculate age from string', () => {
    const birthDateString = birthDate.toISOString().slice(0, 10)
    expect(calculateAge(birthDateString)).toBe(AGE_YEARS)
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
