import { ClassComponent, HostComponent, HostRoot, HostText } from "../shared/ReactWorkTags";
import { reconcileChildFibers } from "./ReactChildFiber";
import { Fiber } from "./ReactFiber";
import { ExpirationTime } from "./ReactFiberExpirationTime";
import { resolveDefaultProps } from "./ReactFiberLazyComponent";
import { FiberRoot } from './ReactFiberRoot'

export type Props = {
  autoFocus?: boolean,
  children?: any,
  hidden?: boolean,
  suppressHydrationWarning?: boolean,
  dangerouslySetInnerHTML?: any,
  style?: {
    display?: string,
  },
};

// function pushHostRootContext(workInProgress: Fiber) {
//   const root: FiberRoot = workInProgress.stateNode
// }


// 更新根节点
function updateHostRoot(
  current: Fiber | null,
  workInProgress: Fiber,
): Fiber | null {
  // pushHostRootContext(workInProgress)

  const updateQueue = workInProgress.updateQueue
  const nextProps = workInProgress.pendingProps
  const prevState = workInProgress.memoizedState

  const prevChildren = prevState !== null ? prevState.element : null;
  
  const nextState = workInProgress.memoizedState

  const nextChildren = nextState.element

  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
  );
  
  return workInProgress.child
}

function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps
): Fiber | null {

  const instance = workInProgress.stateNode
  let shouldUpdate
  if (instance === null) {
    // 没有实例 说明是首次渲染
  }
  // TODO:
  return null
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

export function shouldSetTextContent(type: string, props: Props): boolean {
  return (
    type === 'textarea' ||
    type === 'option' ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}

function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber
): Fiber | null {
  const type = workInProgress.type
  const nextProps = workInProgress.pendingProps
  const prevProps = current !== null ? current.memoizedProps : null

  let nextChildren = nextProps.children
  // 对于文本类型的节点
  // 不一定每次都创建对应的fiber
  // 当这个节点有兄弟节点的时候 会创建对应的fiber
  // 当它是独生子的时候 不会创建fiber 直接返回null
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    // We special case a direct text child of a host node. This is a common
    // case. We won't handle it as a reified child. We will instead handle
    // this in the host environment that also have access to this prop. That
    // avoids allocating another HostText fiber and traversing it.
    nextChildren = null
  }

  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
  );
  return workInProgress.child;
}

// 更新文本节点
function updateHostText(current, workInProgress) {
  // if (current === null) {

  // }

  // Nothing to do here. This is terminal. We'll do the completion step
  // immediately after.
  return null
}

export function beginWork(
  current: Fiber | null,
  workInProgress: Fiber
): Fiber | null {
  const tag = workInProgress.tag

  switch(tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case ClassComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);

      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps
      )
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return updateHostText(current, workInProgress)
  }
}