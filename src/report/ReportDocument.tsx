import { CHECKUP_ITEMS, UNKNOWN_EMOTION } from '../constants'
import { type DateKey, formatFullDay, formatWeekRange, weekDays } from '../dates'
import { emptyDay, type Diary, type DayRecord, type Emotion } from '../types'

interface Props {
  monday: DateKey
  diary: Diary
  clientName: string
}

/** "Тревога (80%), Стыд (40%)" — the print format from the design. */
function formatEmotions(emotions: Emotion[]): string {
  if (emotions.length === 0) return '—'
  return emotions
    .map((e) => (e.name === UNKNOWN_EMOTION ? UNKNOWN_EMOTION : `${e.name} (${e.intensity}%)`))
    .join(', ')
}

function hasCheckupMarks(day: DayRecord): boolean {
  return (
    Object.values(day.checkup.day).some(Boolean) || Object.values(day.checkup.eve).some(Boolean)
  )
}

/**
 * Pure markup for the weekly report — rendered both inside the app and, through
 * `renderToStaticMarkup`, into the standalone file the user prints to PDF.
 */
export function ReportDocument({ monday, diary, clientName }: Props) {
  const name = clientName.trim()

  return (
    <div className="rp-sheet">
      <div className="rp-header">
        <div className="rp-header__title">КПТ-дневник — отчёт за неделю</div>
        <div className="rp-header__meta">
          {formatWeekRange(monday)}
          {name && <span> · {name}</span>}
        </div>
      </div>
      {weekDays(monday).map((key) => (
        <ReportDay key={key} dateKey={key} day={diary[key] ?? emptyDay()} />
      ))}
    </div>
  )
}

function ReportDay({ dateKey, day }: { dateKey: DateKey; day: DayRecord }) {
  const showCheckup = hasCheckupMarks(day)
  const isEmpty = !showCheckup && day.cbt.length === 0 && day.care.length === 0

  return (
    <div className="rp-day">
      <div className="rp-day__title">{formatFullDay(dateKey)}</div>

      {isEmpty && <div className="rp-empty">Нет записей.</div>}

      {showCheckup && (
        <div className="rp-section">
          <div className="rp-label">Чекап</div>
          <table className="rp-table">
            <thead>
              <tr>
                <th>Пункт</th>
                <th className="rp-table__mark">День</th>
                <th className="rp-table__mark">Вечер</th>
              </tr>
            </thead>
            <tbody>
              {CHECKUP_ITEMS.map((item, index) => {
                const inDay = Boolean(day.checkup.day[String(index)])
                const inEve = Boolean(day.checkup.eve[String(index)])
                return (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td className={inDay ? 'rp-table__mark rp-table__mark--on' : 'rp-table__mark'}>
                      {inDay ? '✓' : '—'}
                    </td>
                    <td className={inEve ? 'rp-table__mark rp-table__mark--on' : 'rp-table__mark'}>
                      {inEve ? '✓' : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {day.cbt.length > 0 && (
        <div className="rp-section">
          <div className="rp-label">КПТ-записи</div>
          {day.cbt.map((entry, index) => (
            <div className="rp-entry" key={index}>
              <div>
                <span className="rp-entry__key">Что произошло: </span>
                {entry.happened}
              </div>
              <div>
                <span className="rp-entry__key">Эмоции: </span>
                {formatEmotions(entry.emotions)}
              </div>
              <div>
                <span className="rp-entry__key">Что подумал(а): </span>
                {entry.thought || '—'}
              </div>
              {entry.alt && (
                <div>
                  <span className="rp-entry__key">Что мог(ла) бы подумать: </span>
                  {entry.alt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {day.care.length > 0 && (
        <div className="rp-section rp-section--last">
          <div className="rp-label">Забота о себе</div>
          {day.care.map((item, index) => (
            <div className="rp-care" key={index}>
              {item.time && (
                <>
                  <span className="rp-care__time">{item.time}</span> —{' '}
                </>
              )}
              {item.what}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
