import { describe, expect, it, vi } from 'vitest'

import { createSaver } from './saver'

function deferred<T = void>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('createSaver', () => {
  it('writes immediately when idle', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const saver = createSaver<number>(save, () => {})

    saver.push(1)
    await vi.waitFor(() => expect(save).toHaveBeenCalledWith(1))
  })

  it('keeps only the newest value queued behind an in-flight write', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const saver = createSaver<number>(save, () => {})

    saver.push(1)
    saver.push(2)
    saver.push(3)
    expect(save).toHaveBeenCalledTimes(1)

    first.resolve()
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2))
    // 2 was superseded by 3 before the first write finished.
    expect(save.mock.calls.map(([value]) => value)).toEqual([1, 3])
  })

  it('reports failures and still drains the queue', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const onError = vi.fn()
    const saver = createSaver<number>(save, onError)

    saver.push(1)
    saver.push(2)
    first.reject(new Error('disk on fire'))

    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2))
    expect(onError).toHaveBeenCalledTimes(1)
    expect(save.mock.calls.map(([value]) => value)).toEqual([1, 2])
  })

  it('flush rejects when a write failed, so closing can be held back', async () => {
    const save = vi.fn().mockRejectedValue(new Error('disk full'))
    const onError = vi.fn()
    const saver = createSaver<number>(save, onError)

    saver.push(1)
    await expect(saver.flush()).rejects.toThrow('disk full')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('flush resolves when a later write in the same batch succeeded', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const saver = createSaver<number>(save, () => {})

    saver.push(1)
    saver.push(2)
    const flushing = saver.flush()
    first.resolve()

    await expect(flushing).resolves.toBeUndefined()
  })

  it('flush waits for the queued value, not just the in-flight one', async () => {
    const first = deferred()
    const save = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined)
    const saver = createSaver<number>(save, () => {})

    saver.push(1)
    saver.push(2)

    let flushed = false
    const flushing = saver.flush().then(() => {
      flushed = true
    })

    first.resolve()
    await flushing
    // Closing the window after flush() must not lose the second edit.
    expect(flushed).toBe(true)
    expect(save.mock.calls.map(([value]) => value)).toEqual([1, 2])
  })

  it('flush resolves right away when nothing is pending', async () => {
    const saver = createSaver<number>(vi.fn().mockResolvedValue(undefined), () => {})
    await expect(saver.flush()).resolves.toBeUndefined()
  })
})
