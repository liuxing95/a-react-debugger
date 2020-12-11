import { NoEffect, Placement, Update,  Deletion, PlacementAndUpdate} from '../shared/ReactSideEffectTags'
import { ClassComponent, HostRoot, HostComponent, HostText } from '../shared/ReactWorkTags'
import { createFiber, createWorkInProgress } from '../react-reconciler/ReactFiber'
let isFirstRender = false
let isWorking = false
let isCommitIng = false

let nextUnitOfWork = null

let ifError =(function() {
  // 这个函数没用 就是怕while循环卡死了 可以退出
  let _name = ''
  let _time = 0
  return function(name, time) {
    _name = _name !== name ? name : _name
    _time++
    if (_time >= time) {
      throw `${name}函数的执行次数超过了${time}次`
    }
  }
})()

let eventsName = {
  onClick: 'click',
  onChange: 'change',
  onInput: 'input'
}

// 对象类型的fiber节点
function reconcileSingleElement(returnFiber, element) {
  let type = element.type
  let flag = null
  if (element.$$typeof === Symbol.for('react.element')) {
    if (typeof type === 'function') {
      // 判断是react组件还是一个单纯的函数
      if(type.prototype && type.prototype.isReactComponent) {
        flag = ClassComponent
      }
    } else if (typeof type === 'string') {
      flag = HostComponent
    }

    let fiber = createFiber(flag, element.key, element.props)
    fiber.type = type
    fiber.return = returnFiber
    return fiber
  }
}

function reconcileSingleTextNode(returnFiber, text) {
  let fiber = createFiber(HostText, null, text)
  fiber.return = returnFiber
  return fiber

}

function reconcileChildrenArray(workInProgress, nextChildren) {
  // 这个方法中要通过 index 和 key值 去尽可能多的可以复用的dom节点
  // 这个函数是 react中最最复杂的diff算法
  let nowWorkInProgress = null
  // 是否是首次render
  if (isFirstRender) {
    nextChildren.forEach((reactElement, index) => {
      if (index === 0) {
        if (typeof reactElement === 'string' || typeof reactElement === 'number') {
          workInProgress.child = reconcileSingleTextNode(workInProgress, reactElement)
        } else {
          workInProgress.child = reconcileSingleElement(workInProgress, reactElement)
        }
        nowWorkInProgress = workInProgress.child
      } else {
        if (typeof reactElement === 'string' || typeof reactElement === 'number') {
          nowWorkInProgress.sibling = reconcileSingleTextNode(workInProgress, reactElement)
        } else {
          nowWorkInProgress.sibling = reconcileSingleElement(workInProgress, reactElement)
        }
        nowWorkInProgress = nowWorkInProgress.sibling
      }
    })
    return workInProgress.child
  }
}

// 真正生成子 fiber的过程
function reconcileChildFiber(workInProgress, nextChildren) {
  // 数组的 typeof 也可能是object 所以加了层 typeof 判断
  if (typeof nextChildren === 'object' && !!nextChildren &&  !!nextChildren.$$typeof ) {
    // 说明是一个独生子 并且是 react元素
    return reconcileSingleElement(workInProgress, nextChildren)
  }
  if (nextChildren instanceof Array) {
    return reconcileChildrenArray(workInProgress, nextChildren)
  }

  // 文本节点
  if (typeof nextChildren === 'string' || typeof nextChildren === 'number' ) {
    return reconcileSingleTextNode(workInProgress, nextChildren)
  }
  return null
}

// 生成子节点的fiber
function reconcileChildren(workInProgress, nextChildren) {
  // 只有rootFiber 有workInProgress.alternate
  if (isFirstRender && !!workInProgress.alternate) {
    workInProgress.child = reconcileChildFiber(workInProgress, nextChildren)
    workInProgress.child.effectTag = Placement
  } else {
    workInProgress.child = reconcileChildFiber(workInProgress, nextChildren)
  }
  return workInProgress.child
}

// 操作根节点
function updateHostRoot(workInProgress) {
  // 获取子节点
  let children = workInProgress.memoizedState.element
  // 创建fiber
  return reconcileChildren(workInProgress, children)
}

// 组件类型
function updateClassComponent(workInProgress) {
  let component = workInProgress.type
  let nextProps = workInProgress.pendingProps
  if (!!component.defaultProps) {
    nextProps = Object.assign({}, component.defaultProps, nextProps)
  }
  let shouldUpdate = null
  let instance = workInProgress.stateNode
  if (!instance) {
    // 没有实例 说明是初次渲染 或者是一个新创建的节点
    instance = new component(nextProps)
    workInProgress.memoizedState = instance.state
    workInProgress.stateNode = instance
    instance._reactInternalFiber = workInProgress
    // react Component 创建的 updater
    instance.updater = classComponentUpdater

    // 用来代替 componentWillReciveProps
    let  getDerivedStateFromProps = component.getDerivedStateFromProps
    if (!!getDerivedStateFromProps) {
      let prevState = workInProgress.memoizedState
      let newState = getDerivedStateFromProps(nextProps, prevState)
      if (!(newState === null || newState === undefined)) {
        if (typeof newState === 'object' && !(newState instanceof Array)) {
          workInProgress.memoizedState = Object.assign({}, nextProps, newState)
        }
      }
      instance.state = workInProgress.memoizedState
    }
    // 要处理一些生命周期之类的

    shouldUpdate = true

  } else {
    // 说明不是初次渲染
  }

  let nextChild = instance.render()
  return reconcileChildren(workInProgress, nextChild)
}

function updateHostComponent(workInProgress) {
  let nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children

  // 对于文本类型的节点
  // 不一定每次都创建对应的fiber
  // 当这个节点有兄弟节点的时候 会创建对应的fiber
  // 当它是独生子的时候 不会创建fiber 直接返回null
  if(typeof nextChildren === 'string' || typeof nextChildren === 'number') {
    nextChildren = null
  }

  return reconcileChildren(workInProgress, nextChildren)
}

function beginWork(workInProgress) {
  let tag = workInProgress.tag
  let next = null
  // rootFiber
  if (tag === HostRoot) {
    next = updateHostRoot(workInProgress)
  } else if (tag === ClassComponent) { // class组件
    next = updateClassComponent(workInProgress)
  } else if (tag === HostComponent) {
    next = updateHostComponent(workInProgress)
  } else if (tag === HostText) {
    next = null
  }



  return next
}

function completeWork(workInProgress) {
  // 1. 创建真实的dom实例
  let tag = workInProgress.tag
  let instance = workInProgress.stateNode
  if (tag === HostComponent) {
    if (!instance) {
      // 说明这个节点是初次挂载
      // 也可能是一个新创建的一个节点
      let domElement = document.createElement(workInProgress.type)
      domElement.__reactInternalInstance = workInProgress
      workInProgress.stateNode = domElement

      // 2.  对子节点进行插入
      let node = workInProgress.child
      wapper: while(!!node) {
        let tag = node.tag
        if (tag === HostComponent || tag === HostText) {
          domElement.appendChild(node.stateNode)
        } else {
          node.child.return = node
          node = node.child
          continue
        }

        if (node === workInProgress) break


        while(node.sibling === null) {
          if (node.return === null || node.return === workInProgress) {
            // 跳出哪个循环
            break wapper
          }
          node = node.return
        }

        node.sibling.return = node.return
        node = node.sibling
      }


      // 3.  把属性给它
      let props = workInProgress.pendingProps
      for(let propKey in props) {
        let propValue = props[propKey]
        if (propKey === 'children') {
          if (typeof propValue === 'string' || typeof propValue === 'number') {
            domElement.textContent = propValue
          }
        } else if (propKey === 'style') {
          // 遍历出原型链
          for (let stylePropKey in propValue) {
            if (!propValue.hasOwnProperty(stylePropKey)) continue
            let styleValue = propValue[stylePropKey].trim()
            if (stylePropKey === 'float') {
              stylePropKey = 'cssFloat'
            }
            domElement.style[stylePropKey] = styleValue
          }
        } else if (eventsName.hasOwnProperty(propKey)) {
          let event = props[propKey]
          // react 所有写在jsx模板上的事件都是合成事件
          // 合成事件不会立即执行传递进来的函数
          // 而是先执行一些其他的东西
          // 比如说 事件源对象做一些处理进行合成
          // 会把你所有的事件都代理到根节点上
          // 做事件代理的好处 就是全局可能只用绑定一个事件就够了
          // 再比如它内部会自己写个阻止冒泡的方法或阻止默认的方法
          domElement.addEventListener(eventsName[propKey], event, false)
        } else {
          domElement.setAttribute(propKey, propValue)
        }
      }
    } else {

    }
  } else if (tag === HostText) {
    let oldText = workInProgress.memoizedProps
    let newText = workInProgress.pendingProps
    if (!instance) {
      instance = document.createTextNode(newText)
      workInProgress.stateNode = instance
    } else {
      // 说明不是初次挂载该节点
    }
  }
}

function completeUnitOfWork (workInProgress) {
  // 是个循环
  while(true) {
    // 父节点
    let returnFiber = workInProgress.return
    // 兄弟节点
    let siblingFiber = workInProgress.sibling

    // 创建dom节点
    completeWork(workInProgress)

    let effectTag = workInProgress.effectTag
    let hasChange = (
      effectTag === Update || 
      effectTag === Deletion ||
      effectTag === Placement ||
      effectTag === PlacementAndUpdate
    )

    if (hasChange) {
      if (!!returnFiber.lastEffect) {
        returnFiber.lastEffect.next = workInProgress
      } else {
        returnFiber.firstEffect = workInProgress
      }
      returnFiber.lastEffect = workInProgress
    }

    // 如果有兄弟节点 返回兄弟节点
    if (!!siblingFiber) return siblingFiber
    // 如果是父节点 workInProgress 变成 父节点 继续while 循环
    if (!!returnFiber) {
      workInProgress = returnFiber
      continue 
    }
    return null
  }
}

function performUnitOfWork (workInProgress) {
  // 创建子节点
  let next = beginWork(workInProgress)

  if (next === null) {
    // 对当前节点 创建dom 并进行插入的时机
    next = completeUnitOfWork(workInProgress)
  }
  return next
}
// 循环创建fiber树
function workLoop(nextUnitOfWork) {
  while(!!nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
}

let classComponentUpdater = {
  enqueueSetState(inst, payload, callback) {
    // const fiber = getInstance(inst);
    // const eventTime = requestEventTime();
    // const lane = requestUpdateLane(fiber);

    // const update = createUpdate(eventTime, lane);
    // update.payload = payload;
    // if (callback !== undefined && callback !== null) {
    //   if (__DEV__) {
    //     warnOnInvalidCallback(callback, 'setState');
    //   }
    //   update.callback = callback;
    // }

    // enqueueUpdate(fiber, update);
    // scheduleUpdateOnFiber(fiber, lane, eventTime);

    // if (__DEV__) {
    //   if (enableDebugTracing) {
    //     if (fiber.mode & DebugTracingMode) {
    //       const name = getComponentName(fiber.type) || 'Unknown';
    //       logStateUpdateScheduled(name, lane, payload);
    //     }
    //   }
    // }

    // if (enableSchedulingProfiler) {
    //   markStateUpdateScheduled(fiber, lane);
    // }
  },
}

// 
function commitRoot(root, finishedWork) {
  // 
  isWorking = true
  isCommitIng = true

  let firstEffect = finishedWork.firstEffect
  let nextEffect = null

  // 有三个while循环
  // 第一个循环用来执行 getSnapshotBeforeUpdate
  // while() {

  // }
  // 第二个循环 真正用来操作页面 将有更新的节点 该插入的插入 该更新的更新 该删除的删除
  nextEffect = firstEffect
  
  while(!!nextEffect) {
    ifError('第二个循环', 50)
    let effectTag = nextEffect.effectTag
    if (effectTag === Placement) {
      // 说明是新插入的节点
      // 1. 先找到一个能被插进来的父节点
     
      let parentFiber = nextEffect.return
      let parent = null
      while(!!parentFiber) {
        let tag = parentFiber.tag
        if (tag === HostComponent || tag === HostRoot) {
          break
        }
      }
      if (parentFiber.tag === HostComponent) {
        parent = parentFiber.stateNode
      } else if (parentFiber.tag === HostRoot) {
        parent = parentFiber.stateNode.container
      }

      // 2.  再找能往父节点插入的子节点
      if (isFirstRender) {
        let tag = nextEffect.tag
        if (tag === HostComponent || tag === HostText) {
          parent.appendChild(nextEffect.stateNode)
        } else {
          let child = nextEffect
          while(true) {
            // TODO:
            ifError('第二个循环中的循环', 50)
            const inner_tag = child.tag
            if (inner_tag === HostComponent || inner_tag === HostText) {
              break
            }
            child = child.child
          }
          parent.appendChild(child.stateNode)
        }
      }
    } else if (effectTag === Update) {
      // 说明可能有更新
    } else if (effectTag === Deletion) {
      // 说明要被删除
    } else if (effectTag === PlacementAndUpdate) {
      // 说明该节点换了位置并属性上有更新
    }
    nextEffect = nextEffect.nextEffect
  }

  // 第三个循环 执行剩下的生命周期 componentDidUpdate componentDidMount


  isWorking = false
  isCommitIng = false
}

// commit 页面
function completeRoot(root, finishedWork) {
  // 在下一次setState的时候 要为空
  root.finishedWork = null
  commitRoot(root, finishedWork)
}

// 创建根节点
class ReactRoot {
  constructor(container) {
    this._internalRoot = this._createRoot(container)
  }

  _createRoot(container) {
    // 创建 unInitialFiber
    let unInitialFiber = this._createUnInitialFiber(HostRoot, null, null)
    let root = {
      container: container,
      current: unInitialFiber,
      finishedWork: null // workInProgress 数
    }

    unInitialFiber.stateNode = root

    return root
  }

  _createUnInitialFiber(tag, key, pendingProps) {
    return createFiber(tag, key, pendingProps)
  }

  // 从跟节点开始render
  render(reactElement, callback) {
    let root = this._internalRoot

    // rootFiber
    let workInProgress = createWorkInProgress(root.current, null)

    // react 源码里头是先把这个 reactElement 先放到了 current
    workInProgress.memoizedState = { element: reactElement }

    // 语义化
    nextUnitOfWork = workInProgress

    workLoop(nextUnitOfWork)

    root.finishedWork = root.current.alternate

    // commit 阶段
    if (!!root.finishedWork) {
      completeRoot(root, root.finishedWork)
    }
  }
}

const ReactDOM = {
  render(reactElement, container, callback ) {
    console.log(reactElement)
    isFirstRender = true
    let root = new ReactRoot(container)

    container._reactRootContainer = root

    root.render(reactElement, container)


    isFirstRender = false
  },
}

export default ReactDOM