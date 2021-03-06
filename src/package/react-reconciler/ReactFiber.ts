import { ClassComponent, Fragment, HostComponent, HostRoot, IndeterminateComponent, WorkTag } from '../shared/ReactWorkTags'
import { NoEffect } from '../shared/ReactSideEffectTags'
import { NoWork, ExpirationTime } from './ReactFiberExpirationTime'
import { UpdateQueue } from './ReactUpdateQueue';
import { SideEffectTag } from '../shared/ReactSideEffectTags'
import { ReactFragment, RefObject } from 'package/shared/ReactTypes';
import { ReactElement } from 'package/shared/ReactElementType';

export type Fiber = {
  // Tag identifying the type of fiber.
  tag: WorkTag,

  // Unique identifier of this child.
  key: null | string

  // The value of element.type which is used to preserve the identity during
  // reconciliation of this child.
  elementType: any

  // The resolved function/class/ associated with this fiber.
  type: any

  // the local state associated with this fiber
  stateNode: any

  // The Fiber to return to after finishing processing this one
  return: Fiber | null

  child: Fiber | null
  sibling: Fiber | null
  index: number

  // The ref last used to attach this node
  // I'll avoid adding an owner field for prod and model that as functions.
  ref: null | (((handle: any) => void) & {_stringRef: string}) | RefObject

  pendingProps: any
  memoizedProps: any

  // A queue of state updates and callbacks.
  updateQueue: UpdateQueue<any> | null,

  memoizedState: any,

  // Effect
  effectTag: SideEffectTag,

  // Singly linked list fast path to the next fiber with side-effects.
  nextEffect: Fiber | null,

  // The first and last fiber with side-effect within this subtree. This allows
  // us to reuse a slice of the linked list when we reuse the work done within
  // this fiber.
  firstEffect: Fiber | null,
  lastEffect: Fiber | null,

  // Represents a time in the future by which this work should be completed.
  // Does not include work found in its subtree.
  expirationTime: ExpirationTime,

  // This is used to quickly determine if a subtree has no pending changes.
  childExpirationTime: ExpirationTime,

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: Fiber | null,

  // Time spent rendering this Fiber and its descendants for the current update.
  // This tells us how well the tree makes use of sCU for memoization.
  // It is reset to 0 each time we render and only updated when we don't bailout.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualDuration?: number,

  // If the Fiber is currently active in the "render" phase,
  // This marks the time at which the work began.
  // This field is only set when the enableProfilerTimer flag is enabled.
  actualStartTime?: number,

  // Duration of the most recent render time for this Fiber.
  // This value is not updated when we bailout for memoization purposes.
  // This field is only set when the enableProfilerTimer flag is enabled.
  selfBaseDuration?: number,

  // Sum of base times for all descedents of this Fiber.
  // This value bubbles up during the "complete" phase.
  // This field is only set when the enableProfilerTimer flag is enabled.
  treeBaseDuration?: number,

}
function FiberNode(
  tag: WorkTag,
  key: null | string,
  pendingProps: any
) {
  // 实例
  this.tag = tag; // 标示当前 fiber的类型
  this.key = key
  this.elementType = null;
  this.type = null; // 'div' | 'h1' | Avatar
  this.stateNode = null // 表示当前fiber的实例

  // Fiber
  this.child = null // 表示当前fiber的子节点 每个fiber节点有且只有一个指向它的 firstChild
  this.sibling = null // 表示当前节点的兄弟节点  每个fiber有且只有一个指向兄弟节点
  this.return = null // 表示当前 fiber 的父节点
  this.index = 0

  this.ref = null;

  this.pendingProps = pendingProps // 表示新进来的props
  this.memoizedState = null // 表示当前fiber的state
  this.memoizedProps = null // 表示当前fiber的props
  this.updateQueue = null; // 一条链表 上面挂载的是当前fiber的新的状态
  this.contextDependencies = null; // TODO: ???

  // Effects
  this.effectTag = NoEffect // 表示当前节点进行何种更新
  this.nextEffect = null // 表示下一个要更新的子节点

  this.firstEffect = null // 表示当前节点的有更新的第一个子节点
  this.lastEffect = null // 表示当前节点有更新的最后一个子节点

  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null // 用来连接 current 和 workInProgress
}

export const createFiber = function(
  tag: WorkTag,
  key: null | string,
  pendingProps: any
): Fiber {
  return new FiberNode(tag, key, pendingProps);
}

export function createWorkInProgress(
  current: Fiber,
  pendingProps: any,
  expirationTime?: ExpirationTime
): Fiber {
  // 复用 current.alternate
  let workInProgress = current.alternate
  if (workInProgress === null) {
    // we use a double buffering pooling technique because we know  we will
    // only ever need at most two version of a tree.
    // We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key
    )

    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode

    // 要让这俩东西互相指向
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 我们的 workInProgress 用的是 之前的 Fiber结构  但是我们需要清除之前的数据
    workInProgress.pendingProps = pendingProps
    
    // Reset the effect tag.
    workInProgress.effectTag = NoEffect

    // The effect list is no longer valid.
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }

  // workInProgress 的其他值 复用 current 的属性
  workInProgress.childExpirationTime = current.childExpirationTime
  workInProgress.expirationTime = current.expirationTime

  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  
  // These will be overridden during the parent's reconciliation
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index

  return workInProgress
}

export function createFiberFromFragment(
  elements: ReactFragment,
  expirationTime: ExpirationTime,
  key: null | string
): Fiber {
  const fiber = createFiber(Fragment, key, elements);
  fiber.expirationTime = expirationTime
  return fiber
}

export function createFiberFromElement(
  element: ReactElement,
  expirationTime: ExpirationTime
): Fiber {
  const type = element.type
  const key = element.key
  const pendingProps = element.props
  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    expirationTime
  )
  return fiber
}

export function createFiberFromTypeAndProps(
  type: any, // React$ElementType
  key: null | string,
  pendingProps: any,
  expirationTime: ExpirationTime
): Fiber {
  let fiber

  let fiberTag = IndeterminateComponent
  // The resolved type is set if we know what the final type will be
  let resolvedType = type
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent
    }
  } else if (typeof type === 'string') {
    fiberTag = HostComponent
  } else {
    // 其他类型的组件 TODO:
  }

  fiber = createFiber(fiberTag as WorkTag, key, pendingProps)
  fiber.elementType = type;
  fiber.type = resolvedType;
  fiber.expirationTime = expirationTime;

  return fiber;
}

function shouldConstruct(Component: Function) {
  const prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}

export function createHostRootFiber(
  isConcurrent: boolean
): Fiber {
  return createFiber(HostRoot, null, null)
}