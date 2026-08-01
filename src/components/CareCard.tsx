import { useState } from 'react'

import type { CareItem } from '../types'

interface Props {
  items: CareItem[]
  onAdd: (item: CareItem) => void
  onRemove: (index: number) => void
}

export function CareCard({ items, onAdd, onRemove }: Props) {
  const [what, setWhat] = useState('')
  const [time, setTime] = useState('')

  function submit() {
    if (!what.trim()) return
    onAdd({ what: what.trim(), time })
    setWhat('')
    setTime('')
  }

  return (
    <div className="card card--flow card--care">
      <div className="card__head">
        <div className="card__title">Забота о себе</div>
        <div className="card__subtitle">что я сделал(а) для себя сегодня</div>
      </div>

      {items.length === 0 && (
        <div className="empty">Пока пусто. Например: сходил(а) в кино, ванна с пеной, прогулка.</div>
      )}

      {items.map((item, index) => (
        <div className="care-item" key={index}>
          <span className="chip care-item__time">{item.time || '—'}</span>
          <span className="care-item__text">{item.what}</span>
          <button
            className="remove care-item__remove"
            onClick={() => onRemove(index)}
            title="Удалить"
            aria-label="Удалить запись"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="care-add">
        <input
          className="input care-add__time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Время"
        />
        <input
          className="input care-add__what"
          type="text"
          placeholder="Что вы сделали для себя?"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
        <button className="btn-primary care-add__submit" onClick={submit} disabled={!what.trim()}>
          Добавить
        </button>
      </div>
    </div>
  )
}
