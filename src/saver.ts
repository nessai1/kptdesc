export interface Saver<T> {
  /** Queues a value for saving; supersedes any value still waiting. */
  push: (value: T) => void
  /**
   * Resolves once nothing is left to write. Rejects if a write in the drained batch
   * failed, so the window close handler can keep the window open instead of dropping
   * the edit silently.
   */
  flush: () => Promise<void>
}

/**
 * Keeps saves in order and drops superseded ones: while a write is in flight, only the
 * latest value waits its turn. Without this, two quick checkbox clicks could land on disk
 * out of order and resurrect the older state.
 */
export function createSaver<T>(
  save: (value: T) => Promise<void>,
  onError: (e: unknown) => void,
): Saver<T> {
  let current: Promise<void> | null = null
  let pending: { value: T } | null = null

  async function drain(first: T): Promise<void> {
    let next: { value: T } | null = { value: first }
    let failure: { error: unknown } | null = null
    while (next) {
      try {
        await save(next.value)
      } catch (e) {
        // Report immediately, but keep draining: a later value may well write fine.
        onError(e)
        failure = { error: e }
      }
      next = pending
      pending = null
    }
    if (failure) throw failure.error
  }

  return {
    push(value: T): void {
      if (current) {
        pending = { value }
        return
      }
      current = drain(value).finally(() => {
        current = null
      })
      // The error already went to onError; this keeps it from surfacing as an
      // unhandled rejection when nobody is awaiting flush().
      current.catch(() => {})
    },
    flush(): Promise<void> {
      return current ?? Promise.resolve()
    },
  }
}
