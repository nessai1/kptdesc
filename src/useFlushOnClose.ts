import { useEffect } from 'react'

/**
 * Holds the window open until queued saves reach disk. A save is coalesced in memory
 * while another one is in flight, so closing the window at that exact moment would
 * otherwise drop the newest edit.
 */
export function useFlushOnClose(flush: () => Promise<void>) {
  useEffect(() => {
    let unlisten: (() => void) | undefined
    let cancelled = false

    void (async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const appWindow = getCurrentWindow()
        const stop = await appWindow.onCloseRequested(async (event) => {
          event.preventDefault()
          try {
            await flush()
          } catch {
            // The write failed and the error bar already says so. Keep the window open
            // so the user sees it; closing again goes through with nothing left queued.
            return
          }
          await appWindow.destroy()
        })
        if (cancelled) stop()
        else unlisten = stop
      } catch {
        // Running outside the Tauri shell (plain browser during development):
        // there is no window to intercept, and nothing to flush either.
      }
    })()

    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [flush])
}
