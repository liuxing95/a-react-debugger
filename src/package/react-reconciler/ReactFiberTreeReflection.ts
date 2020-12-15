import { Fiber } from "./ReactFiber";
import { get as getInstance} from '../shared/ReactInstanceMap'
import { NoEffect, Placement } from "../shared/ReactSideEffectTags";
import { HostRoot } from "../shared/ReactWorkTags";

const MOUNTING = 1;
const MOUNTED = 2;
const UNMOUNTED = 3;

function isFiberMountedImpl(fiber: Fiber): number {
  let node = fiber
  if (!fiber.alternate) {
    // If there is no alternate, this might be a new tree that isn't inserted
    // yet. If it is, then it will have a pending insertion effect on it.
    if ((node.effectTag & Placement) !== NoEffect) {
      return MOUNTING
    }

    while(node.return) {
      node = node.return
      if ((node.effectTag & Placement) !== NoEffect) {
        return MOUNTING
      }
    }
  } else {
    while (node.return) {
      node = node.return;
    }
  }
  if (node.tag === HostRoot) {
    // TODO: Check if this was a nested HostRoot when used with
    // renderContainerIntoSubtree.
    return MOUNTED;
  }
  // If we didn't hit the root, that means that we're in an disconnected tree
  // that has been unmounted.
  return UNMOUNTED;
}

export function isMount(component): boolean {
  const fiber: Fiber = getInstance(component)
  if (!fiber) {
    return false
  }
  return isFiberMountedImpl(fiber) === MOUNTED;
}