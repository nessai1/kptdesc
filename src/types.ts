/** Data model shared with the Rust side; the JSON shape comes from the design handoff. */

export type CheckupPeriod = 'day' | 'eve'

/** Keys are checklist item indices, stringified — as stored in the JSON file. */
export type CheckupMarks = Record<string, boolean>

export interface Checkup {
  day: CheckupMarks
  eve: CheckupMarks
}

export interface Emotion {
  name: string
  intensity: number
}

export interface CbtEntry {
  happened: string
  thought: string
  alt: string
  emotions: Emotion[]
}

export interface CareItem {
  what: string
  /** `HH:MM`, empty when the user did not set a time. */
  time: string
}

export interface DayRecord {
  checkup: Checkup
  cbt: CbtEntry[]
  care: CareItem[]
}

/** Diary keyed by local date `YYYY-MM-DD`. */
export type Diary = Record<string, DayRecord>

export interface Settings {
  showHints: boolean
  emotionList: string
  clientName: string
}

export function emptyDay(): DayRecord {
  return { checkup: { day: {}, eve: {} }, cbt: [], care: [] }
}

export function hasAnyData(day: DayRecord | undefined): boolean {
  if (!day) return false
  return (
    day.cbt.length > 0 ||
    day.care.length > 0 ||
    Object.values(day.checkup.day).some(Boolean) ||
    Object.values(day.checkup.eve).some(Boolean)
  )
}
