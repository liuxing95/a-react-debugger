import { HostRoot } from "package/shared/ReactWorkTags";
import { createFiber, createHostRootFiber, Fiber } from "./ReactFiber"
import { ExpirationTime } from "./ReactFiberExpirationTime"

// TODO: This should be lifted into the renderer.
export type Batch = {
  _defer: boolean,
  _expirationTime: ExpirationTime,
  _onComplete: () => any,
  _next: Batch | null,
};

type BaseFiberRootProperties = {
  // Any additional information from the host associated with this root.
  containerInfo: any,
  // Used only by persistent updates.
  pendingChildren: any,
  // The currently active root fiber. This is the mutable root of the tree.
  current: Fiber,

  // The earliest and latest priority levels that are suspended from committing.
  earliestSuspendedTime: ExpirationTime,
  latestSuspendedTime: ExpirationTime,
  // The earliest and latest priority levels that are not known to be suspended.
  earliestPendingTime: ExpirationTime,
  latestPendingTime: ExpirationTime,
  // The latest priority level that was pinged by a resolved promise and can
  // be retried.
  latestPingedTime: ExpirationTime,

  pendingCommitExpirationTime: ExpirationTime,
  // A finished work-in-progress HostRoot that's ready to be committed.
  finishedWork: Fiber | null,
  // Timeout handle returned by setTimeout. Used to cancel a pending timeout, if
  // it's superseded by a new one.
  // timeoutHandle: TimeoutHandle | NoTimeout,
  // Top context object, used by renderSubtreeIntoContainer
  context: Object | null,
  pendingContext: Object | null,
  // Determines if we should attempt to hydrate on the initial mount
  hydrate: boolean,
  // Remaining expiration time on this root.
  // TODO: Lift this into the renderer
  nextExpirationTimeToWorkOn: ExpirationTime,
  expirationTime: ExpirationTime,
  // List of top-level batches. This list indicates whether a commit should be
  // deferred. Also contains completion callbacks.
  // TODO: Lift this into the renderer
  // firstBatch: Batch | null,
  // Linked-list of roots
  nextScheduledRoot: FiberRoot | null,
}

// TODO:
export type FiberRoot = {
  // ...BaseFiberRootProperties,
  // ...ProfilingOnlyFiberRootProperties,
}

export function createFiberRoot(
  containerInfo,
  isConcurrent: boolean
): FiberRoot {
  // Cyclic construction. This cheats system right now because
  // stateNode is any
  const unInitialFiber = createHostRootFiber(isConcurrent);

  let root

  root = {
    current: unInitialFiber,
    containerInfo: containerInfo,
    finishedWork: null,
  }

  unInitialFiber.stateNode = root

  return root as FiberRoot
}

