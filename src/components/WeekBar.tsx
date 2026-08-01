import {
  type DateKey,
  addDays,
  dayNumber,
  formatWeekRange,
  WEEKDAYS_SHORT,
  weekDays,
} from '../dates'
import { hasAnyData, type Diary } from '../types'

interface Props {
  monday: DateKey
  selected: DateKey
  today: DateKey
  diary: Diary
  onSelect: (key: DateKey) => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

export function WeekBar({ monday, selected, today, diary, onSelect, onPrevWeek, onNextWeek }: Props) {
  const canGoForward = addDays(monday, 7) <= today

  return (
    <div className="card card--week">
      <div className="week__nav">
        <button className="week__arrow" onClick={onPrevWeek} aria-label="Предыдущая неделя">
          ‹
        </button>
        <div className="week__label">{formatWeekRange(monday)}</div>
        <button
          className="week__arrow"
          onClick={onNextWeek}
          disabled={!canGoForward}
          aria-label="Следующая неделя"
        >
          ›
        </button>
      </div>
      <div className="week__days">
        {weekDays(monday).map((key, index) => {
          const isSelected = key === selected
          const isFuture = key > today
          const classes = ['day']
          if (key === today && !isSelected) classes.push('day--today')
          if (isSelected) classes.push('day--selected')
          return (
            <button
              key={key}
              className={classes.join(' ')}
              onClick={() => onSelect(key)}
              disabled={isFuture}
              aria-pressed={isSelected}
            >
              <span className="day__dow">{WEEKDAYS_SHORT[index]}</span>
              <span className="day__num">{dayNumber(key)}</span>
              <span className={hasAnyData(diary[key]) ? 'day__dot day__dot--on' : 'day__dot'} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
