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
  // TODO:
}

/**
 * @param WIP workInProgress
 */
const reconcile = (WIP: IFiber): IFiber | undefined => {
  // 根据 type 判断是 hook的更新 还是 host的更新
  isFn(WIP.type) ? updateHook(WIP) : updateHost(WIP)
  // TODO:
}

// 
const updateHook = <P = Attributes>(WIP: IFiber): void => {
  currentFiber = WIP
  
}


export const getCurrentFiber = () => currentFiber || null
export const isFn = (x: any): x is Function => typeof x === "function"
export const isStr = (s: any): s is number | string =>
  typeof s === "number" || typeof s === "string"
export const some = (v: any) => v != null && v !== false && v !== true

  