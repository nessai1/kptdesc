import { CHECKUP_ITEMS } from '../constants'
import type { CheckupMarks, CheckupPeriod, DayRecord } from '../types'
import { CheckIcon, MoonIcon, SunIcon } from './icons'

interface Props {
  day: DayRecord
  showHints: boolean
  onToggle: (period: CheckupPeriod, index: number) => void
}

export function CheckupCard({ day, showHints, onToggle }: Props) {
  return (
    <div className="card">
      <div className="card__head">
        <div className="card__title">Чекап</div>
        <div className="card__subtitle">не забыли ли вы о базовых потребностях?</div>
      </div>
      <div className="checkup__grid">
        <CheckupPanel
          period="day"
          title="День"
          icon={<SunIcon />}
          marks={day.checkup.day}
          showHints={showHints}
          onToggle={onToggle}
        />
        <CheckupPanel
          period="eve"
          title="Вечер"
          icon={<MoonIcon />}
          marks={day.checkup.eve}
          showHints={showHints}
          onToggle={onToggle}
        />
      </div>
    </div>
  )
}

interface PanelProps {
  period: CheckupPeriod
  title: string
  icon: React.ReactNode
  marks: CheckupMarks
  showHints: boolean
  onToggle: (period: CheckupPeriod, index: number) => void
}

function CheckupPanel({ period, title, icon, marks, showHints, onToggle }: PanelProps) {
  const done = CHECKUP_ITEMS.filter((_, index) => marks[String(index)]).length

  return (
    <div className={`checkup-panel checkup-panel--${period}`}>
      <div className="checkup-panel__head">
        <div className="checkup-panel__title">
          {icon}
          {title}
        </div>
        <div className="checkup-panel__progress">
          {done} / {CHECKUP_ITEMS.length}
        </div>
      </div>
      {CHECKUP_ITEMS.map((item, index) => {
        const checked = Boolean(marks[String(index)])
        return (
          <button
            key={item.label}
            type="button"
            className="check-item"
            onClick={() => onToggle(period, index)}
            aria-pressed={checked}
          >
            <span className={checked ? 'check-item__box check-item__box--checked' : 'check-item__box'}>
              {checked && <CheckIcon />}
            </span>
            <span>
              <span className="check-item__label">{item.label}</span>
              {showHints && <span className="check-item__hint">{item.hint}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
