import { describe, expect, it } from 'vitest'

import type { Diary } from '../types'
import { buildReportHtml } from './buildReportHtml'

const diary: Diary = {
  '2026-07-31': {
    checkup: { day: { '0': true }, eve: { '1': true } },
    cbt: [
      {
        happened: 'Написал(а) коллеге, ответа не было',
        thought: 'Я сказал(а) глупость',
        alt: 'У человека мог быть занятой день',
        emotions: [
          { name: 'Тревога', intensity: 80 },
          { name: '?', intensity: 50 },
        ],
      },
    ],
    care: [
      { what: 'Прогулка у реки', time: '14:30' },
      { what: 'Ванна', time: '' },
    ],
  },
}

describe('buildReportHtml', () => {
  const html = buildReportHtml({ monday: '2026-07-27', diary, clientName: 'Иван Иванов' })

  it('is a self-contained document with embedded fonts and styles', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain("font-family: 'Lora'")
    expect(html).toContain('data:font/woff2;base64,')
    expect(html).toContain('.rp-sheet')
    // Nothing may be fetched from the network when the file is opened.
    expect(html).not.toMatch(/(src|href)="https?:/)
  })

  it('covers the whole week, including days without records', () => {
    for (const day of ['Понедельник, 27 июля', 'Пятница, 31 июля', 'Воскресенье, 2 августа']) {
      expect(html).toContain(day)
    }
    expect(html).toContain('Нет записей.')
    expect(html).toContain('27 июля — 2 августа 2026')
    expect(html).toContain('Иван Иванов')
  })

  it('renders the day entries in the print format', () => {
    expect(html).toContain('Тревога (80%), ?')
    expect(html).toContain('Написал(а) коллеге, ответа не было')
    expect(html).toContain('У человека мог быть занятой день')
    expect(html).toContain('14:30')
    expect(html).toContain('Прогулка у реки')
  })

  it('escapes user text instead of injecting it as markup', () => {
    const injected = buildReportHtml({
      monday: '2026-07-27',
      diary: {
        '2026-07-27': {
          checkup: { day: {}, eve: {} },
          cbt: [{ happened: '<script>alert(1)</script>', thought: '', alt: '', emotions: [] }],
          care: [],
        },
      },
      clientName: '',
    })
    expect(injected).not.toContain('<script>alert(1)</script>')
    expect(injected).toContain('&lt;script&gt;')
  })
})
