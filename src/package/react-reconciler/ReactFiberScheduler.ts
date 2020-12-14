import { Incomplete, NoEffect } from "../shared/ReactSideEffectTags";
import { Fiber } from "./ReactFiber";
import { ExpirationTime, NoWork } from "./ReactFiberExpirationTime";
// The time at which we're currently rendering work.
let nextRenderExpirationTime: ExpirationTime = NoWork;

// The next work in progress fiber that we're currently working on.
let nextUnitOfWork: Fiber | null = null;

function performUnitOfWork(workInProgress: Fiber): Fiber | null {
  // The current, flushed, state of this fiber is the alternate.
  // Ideally nothing should rely on this, but relying on it here
  // means that we don't need an additional field on the work in
  // progress.
  const current = workInProgress.alternate;

  // 创建子节点
  // TODO: liuxing
  // let next = beginWork(current, workInProgress, nextRenderExpirationTime);
  let next = null
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
      // TODO: liuxing
      // nextUnitOfWork = completeWork(
      //   current,
      //   workInProgress,
      //   nextRenderExpirationTime
      // )
    }
  }

  // Without this explicit null return Flow complains of invalid return type
  // TODO Remove the above while(true) loop
  // eslint-disable-next-line no-unreachable
  return null;
}