import { useState } from 'react'

import { exportReport } from '../api'
import type { DateKey } from '../dates'
import type { Diary } from '../types'
import { ReportDocument } from './ReportDocument'
import reportCss from './report.css?raw'

interface Props {
  monday: DateKey
  diary: Diary
  clientName: string
  onBack: () => void
  onError: (message: unknown) => void
}

export function ReportScreen({ monday, diary, clientName, onBack, onError }: Props) {
  const [exporting, setExporting] = useState(false)

  async function saveAsPdf() {
    setExporting(true)
    try {
      // Loaded on demand: the renderer and the embedded fonts are only needed here.
      const { buildReportHtml } = await import('./buildReportHtml')
      await exportReport(monday, buildReportHtml({ monday, diary, clientName }))
    } catch (e) {
      onError(e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      {/* Same stylesheet the exported file gets, so preview and print never drift apart. */}
      <style>{reportCss}</style>
      <div className="rp-toolbar rp-no-print">
        <button className="rp-toolbar__button rp-toolbar__button--secondary" onClick={onBack}>
          ← К дневнику
        </button>
        <button
          className="rp-toolbar__button rp-toolbar__button--primary"
          onClick={saveAsPdf}
          disabled={exporting}
        >
          Сохранить в PDF
        </button>
      </div>
      <div className="rp-shell">
        <ReportDocument monday={monday} diary={diary} clientName={clientName} />
      </div>
    </>
  )
}
