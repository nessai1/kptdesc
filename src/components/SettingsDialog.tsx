import { useEffect, useState } from 'react'

import { DEFAULT_EMOTIONS } from '../constants'
import type { Settings } from '../types'
import { CheckIcon } from './icons'

interface Props {
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export function SettingsDialog({ settings, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Настройки">
        <div className="dialog__title">Настройки</div>

        <button
          type="button"
          className="switch"
          onClick={() => setDraft({ ...draft, showHints: !draft.showHints })}
          aria-pressed={draft.showHints}
        >
          <span
            className={draft.showHints ? 'check-item__box check-item__box--checked' : 'check-item__box'}
          >
            {draft.showHints && <CheckIcon />}
          </span>
          <span>
            <span className="check-item__label">Показывать подсказки в чекапе</span>
            <span className="check-item__hint">Пояснение под каждым пунктом чеклиста.</span>
          </span>
        </button>

        <div>
          <div className="field__label">Список эмоций</div>
          <input
            className="input"
            type="text"
            value={draft.emotionList}
            placeholder={DEFAULT_EMOTIONS}
            onChange={(e) => setDraft({ ...draft, emotionList: e.target.value })}
          />
          <div className="hint">Через запятую. Вариант «?» добавляется всегда.</div>
        </div>

        <div>
          <div className="field__label">Имя клиента в отчёте</div>
          <input
            className="input"
            type="text"
            value={draft.clientName}
            placeholder="Необязательно"
            onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
          />
          <div className="hint">Выводится в шапке недельного отчёта рядом с датами.</div>
        </div>

        <div className="dialog__actions">
          <button className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onSave(draft)
              onClose()
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
