import { isMount } from './ReactFiberTreeReflection'
import { get as getInstance, set as setInstance } from '../shared/ReactInstanceMap'
import { Fiber } from './ReactFiber'
import { resolveDefaultProps } from './ReactFiberLazyComponent';
import { Update } from '../shared/ReactSideEffectTags';
import shallowEqual from '../shared/shallowEqual' 
const classComponentUpdater = {
  isMount,
  enqueueSetState(inst, payload, callback) {
    // const fiber = getInstance(inst);
    // const currentTime = requestCurrentTime();
    // const expirationTime = computeExpirationForFiber(currentTime, fiber);

    // const update = createUpdate(fiber)
  }
}

function adoptClassInstance(
  workInProgress: Fiber,
  instance: any
): void {
  instance.updater = classComponentUpdater;
  workInProgress.stateNode = instance
  // The instance needs access to the fiber so that it can schedule updates
  setInstance(instance, workInProgress);
}

export function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any
): any {
  let isLegacyContextConsumer = false
  let unmaskedContext = {}
  let context = null

  const contextType = ctor.contextType

  // 创建一个新的实例
  const instance = new ctor(props, context);
  const state = (
    workInProgress.memoizedState = instance.this.state !== null && instance.this.state !== undefined
    ? instance.state
    : null
  )

  adoptClassInstance(workInProgress, instance)

  return instance
}

// Invokes the mount life-cycles on a previously never rendered instance.
export function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any
): void {
  const instance = workInProgress.stateNode
  instance.props = newProps
  instance.state = workInProgress.memoizedState

  let updateQueue = workInProgress.updateQueue
  if (updateQueue !== null) {
    // processUpdateQueue(
    //   workInProgress,
    //   updateQueue,
    //   newProps,
    //   instance,
    // );
    // instance.state = workInProgress.memoizedState;
  }

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    );
    instance.state = workInProgress.memoizedState;
  }
}

export function applyDerivedStateFromProps(
  workInProgress: Fiber,
  ctor: any,
  getDerivedStateFromProps: (props: any, state: any) => any,
  nextProps: any
) {
  const prevState = workInProgress.memoizedState

  const partialState = getDerivedStateFromProps(nextProps, prevState)
  // Merge the partial state and the previous state.
  const memorizedState =
    partialState === null || partialState === undefined
      ? prevState
      : Object.assign({}, prevState, partialState)

  workInProgress.memoizedState = memorizedState

  // Once the update queue is empty, persist the derived state onto the
  // base state.
  const updateQueue = workInProgress.updateQueue
  if (updateQueue !== null) {
    updateQueue.baseState = memorizedState
  }
}

// Invokes the update life-cycles and returns false if it shouldn't rerender.
export function updateClassInstance(
  current: Fiber,
  workInProgress: Fiber,
  ctor: any,
  newProps: any
): boolean {
  const instance = workInProgress.stateNode

  const oldProps = workInProgress.memoizedProps
  instance.props = 
    workInProgress.type === workInProgress.elementType
      ? oldProps
      : resolveDefaultProps(workInProgress.type, oldProps)

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

  const hasNewLifeCycles = 
    typeof getDerivedStateFromProps === 'function' ||
    typeof instance.getSnapshotBeforeUpdate === 'function'

  // Note: During these life-cycles, instance.props/instance.state are what
  // ever the previously attempted to render - not the "current". However,
  // during componentDidUpdate we pass the "current" props.

  // In order to support react-lifecycles-compat polyfilled components,
  // Unsafe lifecycles should not be invoked for components using the new APIs.
  if (
    !hasNewLifeCycles &&
    (typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
     typeof instance.componentWillReceiveProps)
  ) {
    if (oldProps !== newProps) {
      callComponentWillReceiveProps(
        workInProgress,
        instance,
        newProps
      )
    }
  }

  const oldState = workInProgress.memoizedState
  let newState = (instance.state = oldState)
  let updateQueue = workInProgress.updateQueue
  if (updateQueue !== null) {
    // processUpdateQueue(
    //   workInProgress,
    //   updateQueue,
    //   newProps,
    //   instance,
    // );
    newState = workInProgress.memoizedState;
  }


  if (
    oldProps === newProps &&
    oldState === newState
  ) {
    // If an update was already in progress, we should schedule an Update
    // effect even though we're bailing out, so that cWU/cDU are called.
    if (typeof instance.componentDidUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag = Update
      }
    }

    // if (typeof instance.getSnapshotBeforeUpdate === 'function') {
    //   if (
    //     oldProps !== current.memoizedProps ||
    //     oldState !== current.memoizedState
    //   ) {
    //     workInProgress.effectTag = SnapShot
    //   }
    // }
    return false
  }

  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    )
    newState = workInProgress.memoizedState
  }

  const shouldUpdate = checkShouldComponentUpdate(
    workInProgress,
    ctor,
    oldProps,
    newProps,
    oldState,
    newState,
  );

  if (shouldUpdate) {
    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (
      !hasNewLifeCycles &&
      (typeof instance.UNSAFE_componentWillUpdate === 'function' ||
        typeof instance.componentWillUpdate === 'function')
    ) {
      if (typeof instance.componentWillUpdate === 'function') {
        instance.componentWillUpdate(newProps, newState);
      }
      if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
        instance.UNSAFE_componentWillUpdate(newProps, newState);
      }
    }

    if (typeof instance.componentDidUpdate === 'function') {
      workInProgress.effectTag |= Update;
    }
    // if (typeof instance.getSnapshotBeforeUpdate === 'function') {
    //   workInProgress.effectTag |= Snapshot;
    // }
  } else {
    // If an update was already in progress, we should schedule an Update
    // effect even though we're bailing out, so that cWU/cDU are called.
    if (typeof instance.componentDidUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Update;
      }
    }
    // if (typeof instance.getSnapshotBeforeUpdate === 'function') {
    //   if (
    //     oldProps !== current.memoizedProps ||
    //     oldState !== current.memoizedState
    //   ) {
    //     workInProgress.effectTag |= Snapshot;
    //   }
    // }

    // If shouldComponentUpdate returned false, we should still update the
    // memoized props/state to indicate that this work can be reused.
    workInProgress.memoizedProps = newProps
    workInProgress.memoizedState = newState
  }

  // Update the existing instance's state, props, and context pointers even
  // if shouldComponentUpdate returns false.
  instance.props = newProps;
  instance.state = newState;

  return shouldUpdate;
}

function checkShouldComponentUpdate(
  workInProgress: Fiber,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState
) {
  const instance = workInProgress.stateNode
  if (typeof instance.shouldComponentUpdate === 'function') {
    const shouldUpdate = instance.shouldComponentUpdate(
      newProps,
      newState
    )
    return shouldUpdate;
  }

  if (ctor.prototype && ctor.prototype.isPureReactComponent) {
    return (
      !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    )
  }

  return true
}

function callComponentWillReceiveProps(
  workInProgress,
  instance,
  newProps
) {
  const oldState = instance.state
  if (typeof instance.componentWillReceiveProps === 'function') {
    instance.componentWillReceiveProps(newProps)
  }
  if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
    instance.UNSAFE_componentWillReceiveProps(newProps)
  }

  // TODO: liuxing
  // if (instance.state !== oldState) {
  //   classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  // }
}