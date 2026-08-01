import { renderToStaticMarkup } from 'react-dom/server'

import { type DateKey, formatWeekRange } from '../dates'
import type { Diary } from '../types'
import { ReportDocument } from './ReportDocument'
import reportCss from './report.css?raw'
import { REPORT_FONT_FACES } from './reportFonts'

interface Options {
  monday: DateKey
  diary: Diary
  clientName: string
}

/**
 * Renders the report into a standalone HTML document. The app hands this to Rust,
 * which drops it in a temp file and opens the default browser — "Print → Save as PDF"
 * there produces the report the psychologist gets. WKWebView has no print dialog of
 * its own, which is why the printing step leaves the app.
 */
export function buildReportHtml({ monday, diary, clientName }: Options): string {
  const body = renderToStaticMarkup(
    <ReportDocument monday={monday} diary={diary} clientName={clientName} />,
  )
  const title = `КПТ-дневник — отчёт за неделю ${formatWeekRange(monday)}`

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
${REPORT_FONT_FACES}
html, body { margin: 0; padding: 0; }
${reportCss}
</style>
</head>
<body>
<div class="rp-toolbar rp-no-print">
  <button class="rp-toolbar__button rp-toolbar__button--primary" onclick="window.print()">Сохранить в PDF</button>
</div>
<div class="rp-shell">
${body}
</div>
</body>
</html>
`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
