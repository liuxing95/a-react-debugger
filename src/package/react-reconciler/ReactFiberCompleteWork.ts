import { appendInitialChild, createInstance, createTextInstance, Instance, prepareUpdate } from "../react-dom/client/ReactDOMHostConfig";
import { 
  IndeterminateComponent,
  LazyComponent,
  FunctionComponent,
  ClassComponent,
  HostRoot,
  HostComponent,
  HostText
} from "../shared/ReactWorkTags";
import { Fiber } from "./ReactFiber";
import { ExpirationTime } from "./ReactFiberExpirationTime";

let appendAllChildren
let updateHostComponent
let updateHostText

appendAllChildren = function(
  parent: Instance,
  workInProgress: Fiber,
  
) {
  // we only have the top Fiber that was created but we need recurse down its
  // children to find all the terminal nodes
  let node = workInProgress.child
  while(node !== null) {
    branches: if (node.tag === HostComponent) {
      let instance = node.stateNode
      appendInitialChild(parent, instance);
    } else if (node.tag === HostText) {
      let instance = node.stateNode
      appendInitialChild(parent, instance);
    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === workInProgress) {
      return
    }

    while(node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}


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

updateHostText = function(
  current: Fiber,
  workInProgress: Fiber,
  oldText: string,
  newText: string
) {
  if (oldText !== newText) {
    // If the text content differs, we'll create a new text instance for it.
    // const rootContainerInstance = getRootHostContainer();
    workInProgress.stateNode = createTextInstance(
      newText,
      document,
    );
  }
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
      break
    }
    case HostComponent: {
      const type = workInProgress.type
      if (current !== null && workInProgress.stateNode !== null) {
        // updateHostComponent(current, workInProgress, )
      } else {
        // 说明这个节点是初次挂载
        // 也可能是一个新创建的一个节点
        let instance = createInstance(
          type,
          newProps,
          document,
          workInProgress,
        );

        // 挂载所有的 子节点
        appendAllChildren(instance, workInProgress)
      }
    }
    case HostText: {
      let newText = newProps;
      if (current && workInProgress.stateNode != null) {
        const oldText = current.memoizedProps;
        // If we have an alternate, that means this is an update and we need
        // to schedule a side-effect to do the updates.
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        workInProgress.stateNode = createTextInstance(
          newText,
          document,
        );
      }
    }
  }
  return null
}