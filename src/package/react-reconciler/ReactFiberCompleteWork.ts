import { prepareUpdate } from "../react-dom/client/ReactDOMHostConfig";
import { 
  IndeterminateComponent,
  LazyComponent,
  FunctionComponent,
  ClassComponent,
  HostRoot,
  HostComponent
} from "../shared/ReactWorkTags";
import { Fiber } from "./ReactFiber";
import { ExpirationTime } from "./ReactFiberExpirationTime";

let updateHostComponent


updateHostComponent = function(
  current: Fiber,
  workInProgress: Fiber,
  type: any,
  newProps: any,
  rootContainerInstance: any
) {
  const currentInstance = current.stateNode
  const oldProps = current.memoizedProps;

  // If there are no effects associated with this node, then none of our children had any updates.
  // This guarantees that we can reuse all of them.
  const childrenUnchanged = workInProgress.firstEffect === null
  if (childrenUnchanged && oldProps === newProps) {
    // No changes, just reuse the existing instance.
    // Note that this might release a previous clone.
    workInProgress.stateNode = currentInstance
    return
  }

  const recyclableInstance =workInProgress.stateNode
  // const currentHostContext = getHostContext();
  let updatePayload = null;
  if (oldProps !== newProps) {
    updatePayload = prepareUpdate(
      recyclableInstance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
    );
  }

  if (childrenUnchanged && updatePayload === null) {
    // No changes, just reuse the existing instance.
    // Note that this might release a previous clone.
    workInProgress.stateNode = currentInstance
    return
  }

  // let newInstance = cloneInstance(
  //   currentInstance,
  //   updatePayload,
  //   type,
  //   oldProps,
  //   newProps,
  //   workInProgress,
  //   childrenUnchanged,
  //   recyclableInstance,
  // );
  // if (
  //   finalizeInitialChildren(
  //     newInstance,
  //     type,
  //     newProps,
  //     rootContainerInstance,
  //     currentHostContext,
  //   )
  // ) {
  //   markUpdate(workInProgress);
  // }
  // workInProgress.stateNode = newInstance;
  // if (childrenUnchanged) {
  //   // If there are no other effects in this tree, we need to flag this node as having one.
  //   // Even though we're not going to use it for anything.
  //   // Otherwise parents won't know that there are new children to propagate upwards.
  //   markUpdate(workInProgress);
  // } else {
  //   // If children might have changed, we have to add them all to the set.
  //   appendAllChildren(newInstance, workInProgress, false, false);
  // }
}

export function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime
): Fiber | null {
  const newProps = workInProgress.pendingProps

  switch(workInProgress.tag) {
    case IndeterminateComponent:
      break;
    case LazyComponent:
    case FunctionComponent:
      break
    case ClassComponent: {
      break;
    }
    case HostRoot: {
      // TODO:
    }
    case HostComponent: {
      const type = workInProgress.type
      if (current !== null && workInProgress.stateNode !== null) {
        // updateHostComponent(current, workInProgress, )
      }
    }
  }
  // TODO: liuxing
  return null
}