import { describe, expect, it } from 'vitest'

import {
  addDays,
  dayNumber,
  formatFullDay,
  formatWeekRange,
  keyOf,
  mondayOf,
  parseKey,
  weekDays,
  weekdayIndex,
} from './dates'

describe('date keys', () => {
  it('formats a local date without shifting into another day', () => {
    // Just after midnight is where a UTC round-trip would break for eastern offsets.
    expect(keyOf(new Date(2026, 6, 31, 0, 30))).toBe('2026-07-31')
    expect(keyOf(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })

  it('round-trips through parseKey', () => {
    expect(keyOf(parseKey('2026-02-28'))).toBe('2026-02-28')
    expect(keyOf(parseKey('2024-02-29'))).toBe('2024-02-29')
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
  })
})

describe('weeks', () => {
  it('starts weeks on Monday', () => {
    expect(mondayOf('2026-07-31')).toBe('2026-07-27') // Friday
    expect(mondayOf('2026-07-27')).toBe('2026-07-27') // Monday itself
    expect(mondayOf('2026-08-02')).toBe('2026-07-27') // Sunday belongs to the week before
  })

  it('lists seven consecutive days', () => {
    expect(weekDays('2026-07-27')).toEqual([
      '2026-07-27',
      '2026-07-28',
      '2026-07-29',
      '2026-07-30',
      '2026-07-31',
      '2026-08-01',
      '2026-08-02',
    ])
  })

  it('indexes weekdays from Monday', () => {
    expect(weekdayIndex('2026-07-27')).toBe(0)
    expect(weekdayIndex('2026-08-02')).toBe(6)
  })
})

describe('formatting', () => {
  it('renders a week range that spans two months', () => {
    expect(formatWeekRange('2026-07-27')).toBe('27 июля — 2 августа 2026')
  })

  it('renders a week range inside one month', () => {
    expect(formatWeekRange('2026-07-06')).toBe('6 июля — 12 июля 2026')
  })

  it('renders the selected day', () => {
    expect(formatFullDay('2026-07-31')).toBe('Пятница, 31 июля')
    expect(formatFullDay('2026-01-01')).toBe('Четверг, 1 января')
  })

  it('exposes the day number for the week strip', () => {
    expect(dayNumber('2026-07-31')).toBe(31)
  })
})
