import { HostComponent, HostText } from "package/shared/ReactWorkTags";

const randomKey = Math.random()
.toString(36)
.slice(2);
const internalInstanceKey = '__reactInternalInstance$' + randomKey;
const internalEventHandlersKey = '__reactEventHandlers$' + randomKey;


export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}


export function updateFiberProps(node, props) {
  node[internalEventHandlersKey] = props;
}

/**
 * Given a DOM node return the closest ReactDOMComponent or
 * ReactDOMTextComponent instance ancestor
 * @param node 
 */
export function getClosestInstanceFromNode(node) {
  if (node[internalInstanceKey]) {
    return node[internalInstanceKey]
  }

  while(!node[internalInstanceKey]) {
    if (node.parentNode) {
      node = node.parentNode
    } else {
      return null
    }
  }

  let inst = node[internalInstanceKey]
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber, this will always be the deepest root.
    return inst
  }

  return null
}