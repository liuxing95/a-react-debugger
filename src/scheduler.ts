import { IFiber, ITask, ITaskCallback } from './type'

const queue: ITask[] = []
const threshold: number = 1000 / 60
const unit = []
let deadline: number = 0

export const schedule = (cb) => unit.push(cb) === 1 && postMessage()

export const scheduleWork = (callback: ITaskCallback, fiber: IFiber): void => {
  const job = {
    callback,
    fiber
  }
  queue.push(job)
  schedule(flushWork)
}

const postMessage = (() => {
  // 取出 unit 存储的回调函数 进行执行 并且 清空unit
  const cb = unit.splice(0, unit.length).forEach((c) => c())
  if (typeof MessageChannel !== 'undefined') {
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = cb
    return () => port2.postMessage(null)
  }
})()

const flushWork = (): void => {
  deadline = getTime() + threshold
  // 取出第一个 job
  let job = peek(queue)
  // 有job 并且不处在等待态
  while(job && !shouldYield()) {
    const { callback, fiber } = job as any
    job.callback = null
    const next = callback(fiber)
    if (next) {
      job.callback = next as any
    } else {
      queue.shift()
    }
    job && schedule(flushWork)
  }
}

/**
 * 是否进入等待态
 */
export const shouldYield = (): boolean => {
  return (
    (navigator as any)?.scheduling?.isInputPending() || getTime() >= deadline
  )
}

export const getTime = () => performance.now()

const peek = (queue: ITask[]) => queue[0]


