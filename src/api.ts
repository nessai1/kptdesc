import { invoke } from '@tauri-apps/api/core'

import type { Diary, Settings } from './types'

export function loadDiary(): Promise<Diary> {
  return invoke<Diary>('load_diary')
}

export function saveDiary(diary: Diary): Promise<void> {
  return invoke<void>('save_diary', { diary })
}

export function loadSettings(): Promise<Settings> {
  return invoke<Settings>('load_settings')
}

export function saveSettings(settings: Settings): Promise<void> {
  return invoke<void>('save_settings', { settings })
}

/** Writes the report page to a temp file and opens it in the browser; returns its path. */
export function exportReport(week: string, html: string): Promise<string> {
  return invoke<string>('export_report', { week, html })
}

export function describeError(e: unknown): string {
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message
  return String(e)
}
