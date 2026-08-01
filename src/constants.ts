/** Checkup checklist — the nine basic needs, with the hint shown under each label. */
export const CHECKUP_ITEMS: ReadonlyArray<{ label: string; hint: string }> = [
  {
    label: 'Ел(а) что-то в последние 3–4 часа',
    hint: 'Если нет — съешьте что-нибудь, дополните приём пищи тёплым напитком.',
  },
  {
    label: 'Был(а) на улице в последние 2 дня',
    hint: 'Даже 15 минут медленным шагом помогут наполниться энергией.',
  },
  { label: 'У меня чистая голова и тело', hint: 'Душ или ванна, зубы, расчесать волосы.' },
  { label: 'На мне чистая одежда', hint: 'Чистая домашняя одежда (не пижама для сна!).' },
  {
    label: 'В квартире достаточно чисто',
    hint: 'Подмести, помыть посуду, вынести мусор, проветрить.',
  },
  {
    label: 'Общался(лась) с кем-то последние 2 дня',
    hint: 'Позвоните или напишите кому-то, позовите на прогулку.',
  },
  {
    label: 'Выспался(лась), сон был хорошим',
    hint: 'Соблюдайте гигиену сна, но не заставляйте себя уснуть.',
  },
  { label: 'Делал(а) что-то приятное для себя', hint: 'Еда, ванна, сериал, книга, любимые места.' },
  {
    label: 'Физические упражнения в последние 4 дня',
    hint: 'Лёгкая зарядка — не спеша, без резких движений.',
  },
]

export const DEFAULT_EMOTIONS =
  'Тревога, Грусть, Злость, Страх, Стыд, Вина, Обида, Разочарование, Одиночество, Растерянность, Радость, Спокойствие'

/** Always offered last: "I do not understand what I feel" — carries no intensity. */
export const UNKNOWN_EMOTION = '?'

export const DEFAULT_INTENSITY = 50

/** Emotion names from the settings string, with the "?" option appended. */
export function emotionNames(emotionList: string): string[] {
  const names = emotionList
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((name) => name !== UNKNOWN_EMOTION)
  return [...new Set(names), UNKNOWN_EMOTION]
}
