import { TEXT_NODE } from "../../shared/HTMLNodeType"

/**
 * Gets thr target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 * 
 * @param nativeEvent native browser event
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  let target = nativeEvent.target || nativeEvent.srcElement || window

  // Normalize SVG <use> element events #4963
  if (target.correspondingUseElement) {
    target = target.correspondingUseElement
  }

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}

export default getEventTarget