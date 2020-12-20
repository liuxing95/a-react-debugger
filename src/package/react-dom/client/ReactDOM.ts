import { ExpirationTime } from "../../react-reconciler/ReactFiberExpirationTime";
import { createContainer } from "package/react-reconciler/ReactFiberReconciler";
import { createFiberRoot } from "package/react-reconciler/ReactFiberRoot";
import { ReactNodeList } from "../../shared/ReactTypes"

// ReactWork
function ReactWork() {
  this._callbacks = null
  this._didCommit = false

  this._onCommit = this._onCommit.bind(this);
}
ReactWork.prototype.then = function(onCommit: () => any): void {
  if (this._didCommit) {
    onCommit()
    return
  }
  let callbacks = this._callbacks
  if (callbacks === null) {
    callbacks = this._callbacks = []
  }
  callbacks.push(onCommit)
}
ReactWork.prototype._onCommit = function(): void {
  if (this._didCommit) {
    return
  }
  this._didCommit = true
  const callbacks = this._callbacks
  if (callbacks === null) {
    return
  } 

  for (let i = 0; i < callbacks.length; i++) {
    const callback = callbacks[i];
    callback();
  }
}

// export function updateContainer(
//   element: ReactNodeList,
//   container,
//   parentComponent,
//   callback
// ): ExpirationTime {
//   const current = container.current
  
// }

function ReactRoot(
  container,
  isConcurrent: boolean
) {
  const root = createContainer(container, isConcurrent);
  this._internalRoot = root;
}
// render方法
ReactRoot.prototype.render = function(
  children: ReactNodeList,
  callback?: () => any
) {
  const root = this._internalRoot
  const work = new ReactWork()

  callback = callback === undefined ? null : callback
  if (callback !== null) {
    work.then(callback)
  }
  // updateContainer(children, root, null, work._onCommit)
  return work
}
function legacyCreateRootFromDOMContainer(container) {
  // Legacy roots are not async by default.
  const isConcurrent = false;
  return new ReactRoot(container, isConcurrent);
}
function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children: ReactNodeList,
  container,
  callback?: Function
) {
  let root = container._reactRootContainer
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container)
  }

  root.render(children, callback);
}

// TODO:
function createPortal(){

}

const ReactDOM: Object = {
  createPortal,

  findDOMNode() {

  },

  render(
    element,
    container,
    callback?: Function
  ) {
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      callback
    )
  }
}