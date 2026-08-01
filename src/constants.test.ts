import { describe, expect, it } from 'vitest'

import { DEFAULT_EMOTIONS, emotionNames, UNKNOWN_EMOTION } from './constants'

describe('emotionNames', () => {
  it('trims names and drops empty entries', () => {
    expect(emotionNames(' Тревога ,, Грусть ,')).toEqual(['Тревога', 'Грусть', UNKNOWN_EMOTION])
  })

  it('always ends with the "unknown feeling" option, exactly once', () => {
    expect(emotionNames('Тревога, ?, Грусть')).toEqual(['Тревога', 'Грусть', UNKNOWN_EMOTION])
    expect(emotionNames('')).toEqual([UNKNOWN_EMOTION])
  })

  it('removes duplicates', () => {
    expect(emotionNames('Злость, Злость')).toEqual(['Злость', UNKNOWN_EMOTION])
  })

  it('keeps the default list intact', () => {
    const names = emotionNames(DEFAULT_EMOTIONS)
    expect(names).toHaveLength(13)
    expect(names[0]).toBe('Тревога')
    expect(names.at(-1)).toBe(UNKNOWN_EMOTION)
  })
})
