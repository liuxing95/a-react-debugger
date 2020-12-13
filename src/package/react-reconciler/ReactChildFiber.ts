import { createFiber, createWorkInProgress, Fiber } from "./ReactFiber";
import { ReactElement } from '../shared/ReactElementType'
import { ExpirationTime } from "./ReactFiberExpirationTime";
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "../shared/ReactSymbols";
import { createFiberFromFragment, createFiberFromElement } from './ReactFiber'
import { Fragment, HostText } from "../shared/ReactWorkTags";
import { Deletion, Placement } from "../shared/ReactSideEffectTags";

const isArray = Array.isArray;

// 渲染 单个真实dom元素
export function reconcileSingleElement(
  returnFiber: Fiber,
  // currentFirstChild: Fiber | null,
  element: ReactElement,
  expirationTime?: ExpirationTime
): Fiber {
  const key = element.key
  // let child = currentFirstChild
  // TODO:
  // while(child !== null) {
  //   // TODO: If key === null and child.key === null,
  //   // then this only applies to the first item in the list
  //   if (child.key === null) {

  //   }
  // }

  // REACT_FRAGMENT_TYPE
  if (element.type === REACT_FRAGMENT_TYPE) {
    const created = createFiberFromFragment(
      element.props.children,
      expirationTime,
      element.key
    )
    // 新创建的fiber 连接到 父Fiber 下面
    created.return = returnFiber
    return created
  } else {
    const created = createFiberFromElement(
      element,
      expirationTime
    )
    // TODO: ref
    // created.ref = coerxceRef(returnFiber, currentFirstChild, element);
    created.return = returnFiber
    return created
  }
}

//
export function createFiberFromText(
  content: string | number,
  expirationTime: ExpirationTime,
): Fiber {
  const fiber = createFiber(HostText, null, content)
  fiber.expirationTime = expirationTime;
  return fiber;
}
// 渲染文本节点
export function reconcileSingleTextNode(
  returnFiber: Fiber,
  // currentFirstChild: Fiber | null,
  textContent: string | number,
  expirationTime?: ExpirationTime
): Fiber {
   // There's no need to check for keys on text nodes since we don't have a
    // way to define them.
    // if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
    //   // We already have an existing node so let's just update it and delete
    //   // the rest.
    //   deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
    //   const existing = useFiber(currentFirstChild, textContent, expirationTime);
    //   existing.return = returnFiber;
    //   return existing;
    // }

    // deleteRemainingChildren(returnFiber, currentFirstChild);
    const created = createFiberFromText(
      textContent,
      expirationTime
    )
    created.return = returnFiber;
    return created;
}

// function deleteRemainingChildren(
//   returnFiber: Fiber,
//   currentFirstChild: Fiber | null
// ): null {
//   // TODO:
//   // if (!shouldTrackSideEffects) {
//   //   // Noop.
//   //   return null;
//   // }

//   let childToDelete = currentFirstChild
//   while(childToDelete !== null) {
//     deleteChild(returnFiber, currentFirstChild)
//   }
// }

function useFiber(
  fiber: Fiber,
  pendingProps: any,
  expirationTime: ExpirationTime
): Fiber {
  // We currently set sibling to null and index to 0 here because it is easy
  // to forget to do before returning it. E.g. for the single child case.
  const clone  = createWorkInProgress(fiber, pendingProps, expirationTime)
  // TODO: 为什么设置初始化
  clone.index = 0
  clone.sibling = null
  return clone
}


// 更新文本节点
function updateTextNode(
  returnFiber: Fiber,
  current: Fiber | null,
  textContent: string | number,
  expirationTime: ExpirationTime
) {
  if (current === null || current.tag !== HostText) {
    // Insert
    const created = createFiberFromText(
      textContent,
      expirationTime
    )
    created.return = returnFiber
    return created
  } else {
    // update
    const existing = useFiber(current, textContent, expirationTime)
    existing.return = returnFiber;
    return existing
  }
}
// 更新 Fragment
function updateFragment(
  returnFiber: Fiber,
  current: Fiber | null,
  fragment:  Iterable<any>,
  expirationTime: ExpirationTime,
  key: null | string,
): Fiber {
  if (current === null || current.tag !== Fragment) {
    // Insert
    const created = createFiberFromFragment(
      fragment,
      expirationTime,
      key
    )
    created.return = returnFiber
    return created
  } else {
    // update
    const existing = useFiber(current, fragment, expirationTime)
    existing.return = returnFiber;
    return existing
  }
}

// 更新 原生dom元素
function updateElement(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ReactElement,
  expirationTime: ExpirationTime
): Fiber {
  if (current !== null && current.elementType === element.type) {
    // Move based on index
    const existing = useFiber(current, element.props, expirationTime);
    // existing.ref = coerceRef(returnFiber, current, element);
    existing.return = returnFiber
    return existing
  } else {
    // Insert
    const created = createFiberFromElement(
      element,
      expirationTime
    )
    // created.ref = coerceRef(returnFiber, current, element);
    created.return = returnFiber;
    return created;
  }
}

function createChild(
  returnFiber: Fiber,
  newChild: any,
  expirationTime: ExpirationTime
): Fiber | null {
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // Text nodes don't have keys. If the previous node is implicitly keyed
    // we can continue to replace it without aborting even if it is not a text
    // node
    const created = createFiberFromText(
      newChild,
      expirationTime
    )
    created.return = returnFiber
    return created
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch(newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const created = createFiberFromElement(
          newChild,
          expirationTime,
        );
        // created.ref = coerceRef(returnFiber, null, newChild);
        created.return = returnFiber;
        return created;
      }
      // case REACT_PORTAL_TYPE: {
      //   const created = createFiberFromPortal(
      //     newChild,
      //     returnFiber.mode,
      //     expirationTime,
      //   );
      //   created.return = returnFiber;
      //   return created;
      // }
    }
  }

  if (isArray(newChild)) {
    const created = createFiberFromFragment(
      newChild,
      expirationTime,
      null,
    );
    created.return = returnFiber;
    return created;
  }

  return null
}

function updateSlot(
  returnFiber: Fiber,
  oldFiber: Fiber | null,
  newChild: any,
  expirationTime: ExpirationTime,
): Fiber | null {
  // Update the fiber if the keys match, otherwise return null.

  // 之前设置的key值
  const key = oldFiber !== null ? oldFiber.key : null;

  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // Text nodes don't have keys. If the previous node is implicitly keyed
    // we can continue to replace it without aborting even if it is not a text
    // node.
    if (key !== null) {
      return null
    }
    return updateTextNode(
      returnFiber,
      oldFiber,
      newChild,
      expirationTime
    )
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        if (newChild.key === key) {
          if (newChild.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              oldFiber,
              newChild.props.children,
              expirationTime,
              key
            )
          }
          return updateElement(
            returnFiber,
            oldFiber,
            newChild,
            expirationTime
          )
        } else {
          return null
        }
      }
      // case REACT_PORTAL_TYPE: {
      //   if (newChild.key === key) {
      //     return updatePortal(
      //       returnFiber,
      //       oldFiber,
      //       newChild,
      //       expirationTime,
      //     );
      //   } else {
      //     return null;
      //   }
      // }
    }

    if (isArray(newChild)) {
      if (key !== null) {
        return null
      }
      return updateFragment(
        returnFiber,
        oldFiber,
        newChild,
        expirationTime,
        null
      )
    }

    return null
  }
}

function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number
): number {
  newFiber.index = newIndex
  const current = newFiber.alternate
  if (current !== null) {
    const oldIndex = current.index
    if (oldIndex < lastPlacedIndex) {
      // This is a move
      newFiber.effectTag = Placement
      return lastPlacedIndex
    } else {
      // This item can stay in place.
      return oldIndex;
    }
  } else {
    // This is an insertion
    newFiber.effectTag = Placement
    return lastPlacedIndex
  }
}

function deleteChild(
  returnFiber: Fiber,
  childToDelete: Fiber
): void {
  // Deletions are added in reversed order so we add it to the front.
  // At this point, the return fiber's effect list is empty except for
  // deletions, so we can just append the deletion to the list. The remaining
  // effects aren't added until the complete phase. Once we implement
  // resuming, this may not be true.
  const last = returnFiber.lastEffect
  if (last !== null) {
    last.nextEffect = childToDelete
    returnFiber.lastEffect = childToDelete
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
  }
  childToDelete.nextEffect = null;
  childToDelete.effectTag = Deletion;
}

function deleteRemainingChildren(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null
): null {
  // TODO: For the shouldClone case, this could be micro-optimized a bit by
    // assuming that after the first child we've already added everything.
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
}

function mapRemainingChildren(
  returnFiber: Fiber,
  currentFirstChild: Fiber
): Map<string | number, Fiber> {
  // Add the remaining children to a temporary map so that we can find them by
  // keys quickly. Implicit (null) keys get added to this set with their index
  // instead.
  const existingChildren: Map<string | number, Fiber> = new Map()

  let existingChild = currentFirstChild;
  while(existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild)
    } else {
      existingChildren.set(existingChild.index, existingChild)
    }
    existingChild = existingChild.sibling
  }
  return existingChildren
}

function updateFromMap(
  existingChildren: Map<string | number, Fiber>,
  returnFiber: Fiber,
  newIdx: number,
  newChild: any,
  expirationTime: ExpirationTime,
): Fiber | null {
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // Text nodes don't have keys, so we neither have to check the old nor
    // new node for the key. If both are text nodes, they match.
    const matchedFiber = existingChildren.get(newIdx) || null;
    return updateTextNode(
      returnFiber,
      matchedFiber,
      '' + newChild,
      expirationTime,
    );
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const matchedFiber =
          existingChildren.get(
            newChild.key === null ? newIdx : newChild.key,
          ) || null;
        if (newChild.type === REACT_FRAGMENT_TYPE) {
          return updateFragment(
            returnFiber,
            matchedFiber,
            newChild.props.children,
            expirationTime,
            newChild.key,
          );
        }
        return updateElement(
          returnFiber,
          matchedFiber,
          newChild,
          expirationTime,
        );
      }
      // case REACT_PORTAL_TYPE: {
      //   const matchedFiber =
      //     existingChildren.get(
      //       newChild.key === null ? newIdx : newChild.key,
      //     ) || null;
      //   return updatePortal(
      //     returnFiber,
      //     matchedFiber,
      //     newChild,
      //     expirationTime,
      //   );
      // }
    }

    if (isArray(newChild)) {
      const matchedFiber = existingChildren.get(newIdx) || null;
      return updateFragment(
        returnFiber,
        matchedFiber,
        newChild,
        expirationTime,
        null,
      );
    }
  }

  return null
}

// TODO:
export function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>,
  expirationTime?: ExpirationTime,
): Fiber | null {
  let resultingFirstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;

  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null
  for(; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      expirationTime
    )
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber
      }
      break;
    }

    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null) {
      // TODO: Move out of the loop. This only happens for the first run.
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber
    }
    previousNewFiber = newFiber
    oldFiber = nextOldFiber;
  }

  if (newIdx === newChildren.length) {
    // We've reached the end of the new children. We can delete the rest.
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  if (oldFiber === null) {
    // If we don't have any more existing children we can choose a fast path
    // since the rest will all be insertions.
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(
        returnFiber,
        newChildren[newIdx],
        expirationTime,
      )
      if (!newFiber) {
        continue;
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
    return resultingFirstChild
  }

  // Add all children to a key map for quick lookups.
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

  // Keep scanning and use the map to restore deleted items as moves.
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      expirationTime,
    );

    if (newFiber) {
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }

  return resultingFirstChild;
}

export function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,
  expirationTime?: ExpirationTime,
): Fiber | null {
  const isUnKeyedTopLevelFragment =
    typeof newChild === 'object' &&
    newChild !== null &&
    newChild.type === REACT_FRAGMENT_TYPE &&
    newChild.key === null;
  
  if (isUnKeyedTopLevelFragment) {
    newChild = newChild.props.children
  }

  // handle object types
  const isObject = typeof newChild === 'object' && newChild !== null;
  if (isObject) {
    switch(newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return reconcileSingleElement(returnFiber, newChild, expirationTime)
      // TODO:
      // case REACT_PORTAL_TYPE:
      //   return reconcileSinglePortal(
      //     returnFiber,
      //     currentFirstChild,
      //     newChild,
      //     expirationTime,
      //   )
    }
  }

  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return  reconcileSingleTextNode(returnFiber, newChild, expirationTime)
  }

  if (isArray(newChild)) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime)
  }

  return currentFirstChild
}
 
