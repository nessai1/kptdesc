import { CareCard } from './components/CareCard'
import { CbtCard } from './components/CbtCard'
import { CheckupCard } from './components/CheckupCard'
import { DownloadIcon, SettingsIcon } from './components/icons'
import { WeekBar } from './components/WeekBar'
import { type DateKey, addDays, formatFullDay, mondayOf, todayKey } from './dates'
import type { CareItem, CbtEntry, CheckupPeriod, DayRecord, Diary } from './types'
import { emptyDay } from './types'

interface Props {
  diary: Diary
  selected: DateKey
  emotionOptions: string[]
  showHints: boolean
  onSelect: (key: DateKey) => void
  onUpdateDay: (key: DateKey, update: (day: DayRecord) => DayRecord) => void
  onOpenReport: () => void
  onOpenSettings: () => void
}

export function DiaryScreen({
  diary,
  selected,
  emotionOptions,
  showHints,
  onSelect,
  onUpdateDay,
  onOpenReport,
  onOpenSettings,
}: Props) {
  const today = todayKey()
  const monday = mondayOf(selected)
  const day = diary[selected] ?? emptyDay()

  function toggleCheckup(period: CheckupPeriod, index: number) {
    onUpdateDay(selected, (current) => {
      const marks = { ...current.checkup[period] }
      const key = String(index)
      if (marks[key]) delete marks[key]
      else marks[key] = true
      return { ...current, checkup: { ...current.checkup, [period]: marks } }
    })
  }

  function addEntry(entry: CbtEntry) {
    onUpdateDay(selected, (current) => ({ ...current, cbt: [...current.cbt, entry] }))
  }

  function removeEntry(index: number) {
    onUpdateDay(selected, (current) => ({
      ...current,
      cbt: current.cbt.filter((_, i) => i !== index),
    }))
  }

  function addCare(item: CareItem) {
    onUpdateDay(selected, (current) => ({ ...current, care: [...current.care, item] }))
  }

  function removeCare(index: number) {
    onUpdateDay(selected, (current) => ({
      ...current,
      care: current.care.filter((_, i) => i !== index),
    }))
  }

  /** Landing on the current week selects today, as the design specifies; other weeks open on Monday. */
  function goToWeek(newMonday: DateKey) {
    onSelect(newMonday === mondayOf(today) ? today : newMonday)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <div>
            <h1 className="header__title">КПТ-дневник</h1>
            <div className="header__subtitle">Чекап, мысли и забота о себе — каждый день</div>
          </div>
          <div className="header__actions">
            <button className="btn-icon" onClick={onOpenSettings} title="Настройки" aria-label="Настройки">
              <SettingsIcon />
            </button>
            <button className="btn-primary" onClick={onOpenReport}>
              <DownloadIcon />
              Выгрузить в PDF за неделю
            </button>
          </div>
        </div>

        <WeekBar
          monday={monday}
          selected={selected}
          today={today}
          diary={diary}
          onSelect={onSelect}
          onPrevWeek={() => goToWeek(addDays(monday, -7))}
          onNextWeek={() => goToWeek(addDays(monday, 7))}
        />

        <div className="day-title">{formatFullDay(selected)}</div>

        <CheckupCard day={day} showHints={showHints} onToggle={toggleCheckup} />

        {/* Remounting per day clears the half-typed entry, so it cannot land on the wrong date. */}
        <CbtCard
          key={selected}
          entries={day.cbt}
          emotionOptions={emotionOptions}
          onAdd={addEntry}
          onRemove={removeEntry}
        />

        <CareCard key={`care-${selected}`} items={day.care} onAdd={addCare} onRemove={removeCare} />
      </div>
    </div>
  )
}
