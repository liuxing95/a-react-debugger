// 协调器
import {
  IFiber,
  FreElement,
  FC,
  Attributes,
  HTMLElementEx,
  FreNode,
  IRef,
  IEffect,
} from "./type"
import { scheduleWork, shouldYield, schedule } from "./scheduler"
import { resetCursor } from "./hook";
import { createText, isArr } from './h'
import { createElement } from "./dom";

let currentFiber: IFiber
let finish = null
let deletes = []

// 调度器 赛道 优先级定义
// TODO: 每个优先级的定义
export const enum LANE {
  UPDATE = 1 << 1,
  INSERT = 1 << 2,
  REMOVE = 1 << 3,
  SVG = 1 << 4,
  DIRTY = 1 << 5,
  SUSPENSE = 1 << 6,
  ERROR = 1 << 7,
  BOUNDARY = SUSPENSE | ERROR
}

export const render = (
  vnode: FreElement,
  node: Node,
  done?: () => void
): void => {
  const rootFiber = {
    node,
    props: { children: vnode },
    done
  } as IFiber
  // 触发更新
  // 从 rootFiber 开始
  dispatchUpdate(rootFiber)
}

export const dispatchUpdate = (fiber?: IFiber) => {
  // 如果fiber存在 并且fiber.lane 存在 LANE.DIRTY
  if (fiber && !(fiber.lane & LANE.DIRTY)) {
    fiber.lane = LANE.UPDATE | LANE.DIRTY
    fiber.sibling = null
    scheduleWork(reconcileWork as any, fiber)
  }
}

/**
 * 
 * @param WIP workInProgress
 */
const reconcileWork = (WIP?: IFiber): boolean => {
  // 遍历处理 WIP => 
  while(WIP && !shouldYield()) WIP = reconcile(WIP)
  if (WIP) return reconcileWork.bind(null, WIP)
  // TODO:
  // if (finish) commitWork(finish)
  return null
}

/**
 * @param WIP workInProgress
 */
const reconcile = (WIP: IFiber): IFiber | undefined => {
  // 根据 type 判断是 hook的更新 还是 host的更新
  isFn(WIP.type) ? updateHook(WIP) : updateHost(WIP)
  if (WIP.child) return WIP.child
  while(WIP) {
    if (!finish && WIP.lane & LANE.DIRTY) {
      finish = WIP
      WIP.lane &= ~LANE.DIRTY
      return null
    }
    if (WIP.sibling) return WIP.sibling
    WIP = WIP.parent
  }
}

/**
 * function函数组件更新
 * @param WIP workInProgress
 */
const updateHook = <P = Attributes>(WIP: IFiber): void => {
  // currentFiber 指向 workInProgress 并且重置 cursor 从 0 开始计算
  // 这样计算 getHook的时候能得到正常的值
  currentFiber = WIP
  resetCursor()
  try {
    var children = (WIP.type as FC<P>)(WIP.props)
  } catch(e) {
    // TODO: 错误处理
  }
  isStr(children) && (children = simpleVnode(children))
  reconcileChildren(WIP, children)
}

const updateHost = (WIP: IFiber): void => {
  WIP.parentNode = getParentNode(WIP) as any

  if (!WIP.node) {
    if (WIP.type === 'svg') WIP.lane |= LANE.SVG
    WIP.node = createElement(WIP) as HTMLElementEx
  }
  reconcileChildren(WIP, WIP.props.children)
}

/**
 * 获取当前WIP的最近的 父节点 就是 往上遍历 获取 最近的一个 fiber.type 不是函数的fiber.node
 */
const getParentNode(WIP: IFiber):HTMLElement | undefined => {
  while((WIP = WIP.parent)) {
    if (!isFn(WIP)) return WIP.node
  }
}

const clone = (a, b) => {
  a.lastProps = b.props
  a.node = b.node
  a.kids = b.kids
  a.hooks = b.hooks
  a.ref = b.ref
}

// TODO: 设计到diff算法比较
const reconcileChildren = (WIP: any, children: FreNode): void => {
  let aCh = WIP.kids || [], // aCH 代表当前fiber的子 fiber 的长度
    bCh = (WIP.kids = arrayfy(children) as any), // bCh设置为 传入的react.element 的长度 并且同时把 WIP.kids 重新赋值
    aHead = 0,
    bHead = 0,
    aTail = aCh.length - 1,
    bTail = bCh.length - 1,
    map = null,
    // 新的 WIP.kids的长度 一定是 传入的 children的长度
    ch = Array(bCh.length)

    // 第一遍遍历 看是否有可复用的fiber
  while(aHead <= aTail && bHead <= bTail) {
    let c = null
    if (aCh[aHead] == null) {
      aHead++
    } else if (aCh[aTail] == null) {
      aTail--
    } else if (same(aCh[aHead], bCh(bHead))) {
      // 如果 aCh[aHead] bCh(bHead) 代表两个属性一样 可复用
      c = bCh[bHead]
      clone(c, aCh[aHead])
      ch[bHead] = c
      aHead++
      bHead++
    } else if (same(aCh[aTail], bCh[bTail])) {
      c = bCh[bTail]
      clone(c, aCh[aTail])
      c.lane |= LANE.UPDATE
      ch[bTail] = c
      aTail--
      bTail--
    } else {
      if (!map) {
        map = new Map()
        for (let i = aHead; i <= aTail; i++) {
          let k = getKey(aCh[i])
          k && map.set(k, i)
        }
      }
      const key = getKey(bCh[bHead])
      if (map.has(key)) {
        const oldKid = aCh[map.get(key)]
        c = bCh[bHead]
        clone(c, oldKid)
        c.lane = LANE.INSERT
        c.after = aCh[aHead]
        ch[bHead] = c
        aCh[map.get(key)] = null
      } else {
        c = bCh[bHead]
        c.lane = LANE.INSERT
        c.node = null
        c.after = aCh[aHead]
      }
      bHead++
    }
  }

  const after = ch[bTail + 1]

  while(bHead <= bTail) {
    let c = bCh[bHead]
    if (c) {
      c.lane = LANE.INSERT
      c.after = after
      c.node = null
    }
    bHead++
  }

  while (aHead <= aTail) {
    let c = aCh[aHead]
    if (c) {
      c.lane = LANE.REMOVE
      deletes.push(c)
    }
    aHead++
  }

  for (var i = 0, prev = null; i < bCh.length; i++) {
    const child = bCh[i]
    child.parent = WIP
    if (i > 0) {
      prev.sibling = WIP
    } else {
      if (WIP.lane & LANE.SVG) child.lane |= LANE.SVG
      WIP.child = child
    }
    prev = child
  }
}

const getKey = (vdom) => (vdom == null ? vdom : vdom.key)
const getType = (vdom) => (isFn(vdom.type) ? vdom.type.name : vdom.type)

const simpleVnode = (type: any, props?: any) => 
  isStr(type) ? createText(type as string) : isFn(type) ? type(props) : type



export const getCurrentFiber = () => currentFiber || null
export const isFn = (x: any): x is Function => typeof x === "function"
export const isStr = (s: any): s is number | string =>
  typeof s === "number" || typeof s === "string"
export const some = (v: any) => v != null && v !== false && v !== true

const same = (a, b) => {
  return getKey(a) === getKey(b) && getType(a) === getType(b)
}
const arrayfy = (arr) => (!arr ? [] : isArr(arr) ? arr : [arr])
  