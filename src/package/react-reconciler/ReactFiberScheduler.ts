import { HostRoot } from "../shared/ReactWorkTags";
import { Incomplete, NoEffect, PerformedWork } from "../shared/ReactSideEffectTags";
import { Fiber } from "./ReactFiber";
import { ExpirationTime, msToExpiration, NoWork } from "./ReactFiberExpirationTime";
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from "./ReactFiberCompleteWork";
// The time at which we're currently rendering work.
let nextRenderExpirationTime: ExpirationTime = NoWork;

let isRendering: boolean = false;

// The next work in progress fiber that we're currently working on.
let nextUnitOfWork: Fiber | null = null;

// TODO:
let originalStartTimeMs: number = 0;

let currentRendererTime: ExpirationTime = msToExpiration(
  originalStartTimeMs,
);

let currentSchedulerTime: ExpirationTime = currentRendererTime;

// 创建fiber节点的过程
function performUnitOfWork(workInProgress: Fiber): Fiber | null {
  // The current, flushed, state of this fiber is the alternate.
  // Ideally nothing should rely on this, but relying on it here
  // means that we don't need an additional field on the work in
  // progress.
  const current = workInProgress.alternate;

  // 创建子节点
  let next = beginWork(current, workInProgress);
  workInProgress.memoizedProps = workInProgress.pendingProps;

  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    // 对当前节点 创建dom 并进行插入的时机
    next = completeUnitOfWork(workInProgress);
  }

  return next;
}

function completeUnitOfWork(workInProgress: Fiber): Fiber | null {
  // Attempt to complete the current unit of work, then move to the
  // next sibling. If there are no more siblings, return to the
  // parent fiber

  while(true) {
    // The current, flushed, state of this fiber is the alternate.
    // Ideally nothing should rely on this, but relying on it here
    // means that we don't need an additional field on the work in
    // progress.
    const current = workInProgress.alternate

    const returnFiber = workInProgress.return
    const siblingFiber = workInProgress.sibling

    if ((workInProgress.effectTag & Incomplete) === NoEffect) {
      // This fiber completed.
      // Remember we're completing this unit so we can find a boundary if it fails.
      nextUnitOfWork = workInProgress

      // 创建dom节点
      nextUnitOfWork = completeWork(
        current,
        workInProgress,
        nextRenderExpirationTime
      )

      if (nextUnitOfWork !== null) {
        return nextUnitOfWork
      }

      if (returnFiber !== null &&
        (returnFiber.effectTag & Incomplete) === NoEffect
      ) {
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = workInProgress.firstEffect
        }
        if (workInProgress.lastEffect !== null) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
          }
          returnFiber.lastEffect = workInProgress.lastEffect
        }

        // If this fiber had side-effects, we append it AFTER the children's
        // side-effects. We can perform certain side-effects earlier if
        // needed, by doing multiple passes over the effect list. We don't want
        // to schedule our own side-effect on our own list because if end up
        // reusing children we'll schedule this effect onto itself since we're
        // at the end.
        const effectTag = workInProgress.effectTag
        // Skip both NoWork and PerformedWork tags when creating the effect list.
        // PerformedWork effect is read by React DevTools but shouldn't be committed.
        if (effectTag > PerformedWork) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress
          } else {
            returnFiber.firstEffect = workInProgress
          }
          returnFiber.lastEffect = workInProgress
        }
      }

      if (siblingFiber !== null) {
        return siblingFiber
      } else if (returnFiber !== null) {
        workInProgress = returnFiber;
        continue;
      } else {
        return null
      }
    } else {
      // TODO: liuxing
    }
  }

  // Without this explicit null return Flow complains of invalid return type
  // TODO Remove the above while(true) loop
  // eslint-disable-next-line no-unreachable
  return null;
}

function requestCurrentTime() {
  // requestCurrentTime is called by the scheduler to compute an expiration
  // time

  // Expiration times are computed by adding to the current time (the start time)
  // However, if two updates are scheduled within the same event,
  // we should treat their start times as simultaneous, even if the actual clock
  // time has advanced between the first and second call.

  // In other words, because expiration times determine how updates are batched,
  // we want all updates of like priority that occur within the same event to
  // receive the same expiration time. Otherwise we get tearing.
  //

  // We keep track of two separate times: the current "renderer" time and the
  // current "scheduler" time. The renderer time can be updated whenever; it
  // only exists to minimize the calls performance.now.
  //
  // But the scheduler time can only be updated if there's no pending work, or
  // if we know for certain that we're not in the middle of an event.

  if (isRendering) {
    // We're already rendering. Return the most recently read time.
    return currentSchedulerTime
  }
  // check if there's pending work
}

// 循环创建fiber树
export function workLoop(isYieldy = false) {
  if (!isYieldy) {
    // Flush work without yielding
    while(nextUnitOfWork) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  }
  // else {
  //   // Flush asynchronous work until there's a higher priority event
  //   while(nextUnitOfWork !== null && !shouldYieldToRenderer()) {
  //     nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  //   }
  // }
}