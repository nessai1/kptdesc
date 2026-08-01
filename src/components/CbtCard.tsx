import { useState } from 'react'

import { DEFAULT_INTENSITY, UNKNOWN_EMOTION } from '../constants'
import type { CbtEntry, Emotion } from '../types'

interface Props {
  entries: CbtEntry[]
  emotionOptions: string[]
  onAdd: (entry: CbtEntry) => void
  onRemove: (index: number) => void
}

/** "Тревога · 80%", or a bare "?" for the "I don't know what I feel" option. */
function formatEmotion(emotion: Emotion): string {
  return emotion.name === UNKNOWN_EMOTION
    ? UNKNOWN_EMOTION
    : `${emotion.name} · ${emotion.intensity}%`
}

export function CbtCard({ entries, emotionOptions, onAdd, onRemove }: Props) {
  return (
    <div className="card card--flow card--cbt">
      <div className="card__head">
        <div className="card__title">КПТ-дневник</div>
        <div className="card__subtitle">ситуация → эмоция → мысль → альтернатива</div>
      </div>

      {entries.length === 0 && <div className="empty">Записей за этот день пока нет.</div>}

      {entries.map((entry, index) => (
        <article className="entry" key={index}>
          <button
            className="remove entry__remove"
            onClick={() => onRemove(index)}
            title="Удалить"
            aria-label="Удалить запись"
          >
            ✕
          </button>
          <div>
            <span className="label">Что произошло</span>
            <div className="entry__text">{entry.happened}</div>
          </div>
          <div>
            <span className="label">Эмоции</span>
            <div className="entry__chips">
              {entry.emotions.map((emotion) => (
                <span className="chip" key={emotion.name}>
                  {formatEmotion(emotion)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Что я подумал(а)</span>
            <div className="entry__text">{entry.thought}</div>
          </div>
          {entry.alt && (
            <div className="entry__alt">
              <span className="label">Что мог(ла) бы подумать</span>
              <div className="entry__text">{entry.alt}</div>
            </div>
          )}
        </article>
      ))}

      <NewEntryForm emotionOptions={emotionOptions} onAdd={onAdd} />
    </div>
  )
}

function NewEntryForm({
  emotionOptions,
  onAdd,
}: {
  emotionOptions: string[]
  onAdd: (entry: CbtEntry) => void
}) {
  const [happened, setHappened] = useState('')
  const [thought, setThought] = useState('')
  const [alt, setAlt] = useState('')
  const [emotions, setEmotions] = useState<Emotion[]>([])

  function toggleEmotion(name: string) {
    setEmotions((prev) =>
      prev.some((e) => e.name === name)
        ? prev.filter((e) => e.name !== name)
        : [...prev, { name, intensity: DEFAULT_INTENSITY }],
    )
  }

  function setIntensity(name: string, intensity: number) {
    setEmotions((prev) => prev.map((e) => (e.name === name ? { ...e, intensity } : e)))
  }

  function submit() {
    if (!happened.trim()) return
    onAdd({
      happened: happened.trim(),
      thought: thought.trim(),
      alt: alt.trim(),
      emotions,
    })
    setHappened('')
    setThought('')
    setAlt('')
    setEmotions([])
  }

  return (
    <div className="form">
      <div className="form__title">Новая запись</div>

      <div>
        <div className="field__label">Что произошло?</div>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Ситуация, факт — без оценок"
          value={happened}
          onChange={(e) => setHappened(e.target.value)}
        />
      </div>

      <div>
        <div className="field__label field__label--chips">
          Эмоции{' '}
          <span className="field__note">— можно несколько; «?» если непонятно, что это</span>
        </div>
        <div className="chips">
          {emotionOptions.map((name) => {
            const selected = emotions.some((e) => e.name === name)
            return (
              <button
                key={name}
                type="button"
                className={selected ? 'chip-button chip-button--selected' : 'chip-button'}
                onClick={() => toggleEmotion(name)}
                aria-pressed={selected}
              >
                {name}
              </button>
            )
          })}
        </div>
        {emotions.length > 0 && (
          <div className="intensities">
            {emotions.map((emotion) => (
              <div className="intensity" key={emotion.name}>
                <span className="intensity__name">{emotion.name}</span>
                <input
                  className="intensity__slider"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={emotion.intensity}
                  onChange={(e) => setIntensity(emotion.name, Number(e.target.value))}
                  aria-label={`Интенсивность: ${emotion.name}`}
                />
                <span className="intensity__value">{emotion.intensity}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="field__label">Что я подумал(а)?</div>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Автоматическая мысль"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
        />
      </div>

      <div>
        <div className="field__label">
          Что мог(ла) бы подумать? <span className="field__note">— необязательно</span>
        </div>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Альтернативная, более поддерживающая мысль"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
      </div>

      <div>
        <button className="btn-primary form__submit" onClick={submit} disabled={!happened.trim()}>
          Добавить запись
        </button>
      </div>
    </div>
  )
}
