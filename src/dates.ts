/**
 * Date keys are local `YYYY-MM-DD` strings, never ISO/UTC — a UTC round-trip would
 * shift the day for anyone east or west of Greenwich. Weeks start on Monday.
 */

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
export const WEEKDAYS_FULL = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
]

export type DateKey = string

export function keyOf(date: Date): DateKey {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function parseKey(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

export function todayKey(): DateKey {
  return keyOf(new Date())
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = parseKey(key)
  date.setDate(date.getDate() + days)
  return keyOf(date)
}

/** Monday of the week the given day belongs to. */
export function mondayOf(key: DateKey): DateKey {
  const date = parseKey(key)
  const weekdayFromMonday = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - weekdayFromMonday)
  return keyOf(date)
}

/** Seven date keys, Monday through Sunday. */
export function weekDays(monday: DateKey): DateKey[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/** Index within the week, 0 = Monday. */
export function weekdayIndex(key: DateKey): number {
  return (parseKey(key).getDay() + 6) % 7
}

/** "28 июля — 3 августа 2026" */
export function formatWeekRange(monday: DateKey): string {
  const start = parseKey(monday)
  const end = parseKey(addDays(monday, 6))
  const from = `${start.getDate()} ${MONTHS_GENITIVE[start.getMonth()]}`
  const to = `${end.getDate()} ${MONTHS_GENITIVE[end.getMonth()]} ${end.getFullYear()}`
  return `${from} — ${to}`
}

/** "Пятница, 31 июля" */
export function formatFullDay(key: DateKey): string {
  const date = parseKey(key)
  return `${WEEKDAYS_FULL[weekdayIndex(key)]}, ${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`
}

/** Day number for the week strip. */
export function dayNumber(key: DateKey): number {
  return parseKey(key).getDate()
}
