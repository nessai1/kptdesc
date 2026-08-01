import { useCallback, useMemo, useState } from 'react'

import { describeError } from './api'
import { SettingsDialog } from './components/SettingsDialog'
import { DEFAULT_EMOTIONS, emotionNames } from './constants'
import { DiaryScreen } from './DiaryScreen'
import { type DateKey, mondayOf, todayKey } from './dates'
import { ReportScreen } from './report/ReportScreen'
import { useDiary } from './useDiary'
import { useFlushOnClose } from './useFlushOnClose'

type View = { kind: 'diary' } | { kind: 'report'; monday: DateKey }

export function App() {
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((e: unknown) => setError(describeError(e)), [])

  const { diary, settings, loadError, retryLoad, updateDay, updateSettings, flushSaves } =
    useDiary(onError)
  useFlushOnClose(flushSaves)

  const [selected, setSelected] = useState<DateKey>(() => todayKey())
  const [view, setView] = useState<View>({ kind: 'diary' })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const emotionOptions = useMemo(
    () => emotionNames(settings?.emotionList.trim() || DEFAULT_EMOTIONS),
    [settings?.emotionList],
  )

  // Editing is blocked while the diary cannot be read: saving now would write the empty
  // state over records that are still on disk and may well be recoverable by hand.
  if (loadError) {
    return (
      <div className="page">
        <div className="container">
          <div className="card card--flow card--care">
            <div className="card__head">
              <div className="card__title">Не удалось открыть дневник</div>
            </div>
            <div className="empty">{loadError}</div>
            <div className="hint">
              Записи на диске не изменялись. Проверьте файл diary.json в папке данных приложения
              и повторите попытку — редактирование заблокировано, чтобы не перезаписать их.
            </div>
            <div className="dialog__actions">
              <button className="btn-primary" onClick={retryLoad}>
                Повторить
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!diary || !settings) {
    return <div className="loading">Загрузка…</div>
  }

  return (
    <>
      {view.kind === 'diary' ? (
        <DiaryScreen
          diary={diary}
          selected={selected}
          emotionOptions={emotionOptions}
          showHints={settings.showHints}
          onSelect={setSelected}
          onUpdateDay={updateDay}
          onOpenReport={() => setView({ kind: 'report', monday: mondayOf(selected) })}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <ReportScreen
          monday={view.monday}
          diary={diary}
          clientName={settings.clientName}
          onBack={() => setView({ kind: 'diary' })}
          onError={onError}
        />
      )}

      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          onSave={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {error && (
        <div className="error-bar" role="alert">
          <span>{error}</span>
          <button className="error-bar__close" onClick={() => setError(null)} aria-label="Закрыть">
            ✕
          </button>
        </div>
      )}
    </>
  )
}
