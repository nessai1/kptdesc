import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { describeError, loadDiary, loadSettings, saveDiary, saveSettings } from './api'
import { DEFAULT_EMOTIONS } from './constants'
import type { DateKey } from './dates'
import { createSaver } from './saver'
import { emptyDay, type DayRecord, type Diary, type Settings } from './types'

/** Mirrors `Settings::default()` on the Rust side; used only when settings fail to load. */
const DEFAULT_SETTINGS: Settings = {
  showHints: true,
  emotionList: DEFAULT_EMOTIONS,
  clientName: '',
}

/**
 * Diary and settings state backed by the JSON files on disk. Every change updates the
 * UI immediately and is written out right after — the same "saves instantly" behaviour
 * the design asks for, with writes coalesced so rapid clicks cannot land out of order.
 */
export function useDiary(onError: (error: unknown) => void) {
  const [diary, setDiary] = useState<Diary | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const diaryRef = useRef<Diary>({})
  const errorRef = useRef(onError)
  errorRef.current = onError

  const reportError = useCallback((e: unknown) => errorRef.current(e), [])
  const diarySaver = useMemo(() => createSaver(saveDiary, reportError), [reportError])
  const settingsSaver = useMemo(() => createSaver(saveSettings, reportError), [reportError])

  /** Waits for anything still queued — the window close handler holds on this. */
  const flushSaves = useCallback(
    () => Promise.all([diarySaver.flush(), settingsSaver.flush()]).then(() => undefined),
    [diarySaver, settingsSaver],
  )

  useEffect(() => {
    let cancelled = false

    // The two files are loaded independently on purpose. Settings are cheap to recreate,
    // so a broken settings.json falls back to defaults and the diary stays usable; the
    // diary itself must never fall back to empty state, because the next edit would save
    // that emptiness over a file we merely failed to read.
    void (async () => {
      try {
        const loaded = await loadSettings()
        if (!cancelled) setSettings(loaded)
      } catch (e) {
        if (cancelled) return
        setSettings(DEFAULT_SETTINGS)
        errorRef.current(e)
      }
    })()

    void (async () => {
      try {
        const loaded = await loadDiary()
        if (cancelled) return
        diaryRef.current = loaded
        setDiary(loaded)
        setLoadError(null)
      } catch (e) {
        if (cancelled) return
        setLoadError(describeError(e))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retryLoad = useCallback(() => {
    setLoadError(null)
    setAttempt((n) => n + 1)
  }, [])

  const updateDay = useCallback(
    (key: DateKey, update: (day: DayRecord) => DayRecord) => {
      const current = diaryRef.current[key] ?? emptyDay()
      const next: Diary = { ...diaryRef.current, [key]: update(current) }
      diaryRef.current = next
      setDiary(next)
      diarySaver.push(next)
    },
    [diarySaver],
  )

  const updateSettings = useCallback(
    (next: Settings) => {
      setSettings(next)
      settingsSaver.push(next)
    },
    [settingsSaver],
  )

  return { diary, settings, loadError, retryLoad, updateDay, updateSettings, flushSaves }
}
