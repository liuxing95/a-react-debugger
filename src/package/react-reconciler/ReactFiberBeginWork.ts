import { reconcileChildFibers } from "./ReactChildFiber";
import { Fiber } from "./ReactFiber";
import { ExpirationTime } from "./ReactFiberExpirationTime";
import { FiberRoot } from './ReactFiberRoot'

// function pushHostRootContext(workInProgress: Fiber) {
//   const root: FiberRoot = workInProgress.stateNode
// }
function updateHostRoot(
  current: Fiber,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime
) {
  // pushHostRootContext(workInProgress)

  const updateQueue = workInProgress.updateQueue
  const nextProps = workInProgress.pendingProps
  const prevState = workInProgress.memoizedState

  const prevChildren = prevState !== null ? prevState.element : null;
  // processUpdateQueue(

  // )
}

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren:any,
  renderExpiration?: ExpirationTime
) {
  if (current == null) {
    // if this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. 
    // Instead,we will add them all to the child before it gets rendered. 
    // That means we can optimize this reconciliation pass by not tracking side-effects.
    // workInProgress.child = mountChildFibers(
    //   workInProgress,
    //   null,
    //   nextChildren,
    //   renderExpirationTime,
    // )
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.

    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpiration
    )
  }
  return workInProgress.child
}