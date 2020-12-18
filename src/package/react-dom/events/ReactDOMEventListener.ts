import { addEventBubbleListener } from "./EventListener";
import { DOMTopLevelEventType } from "../../events/TopLevelEventTypes";
import { getRawEventName } from "./DOMTopLevelEventTypes";
import { AnyNativeEvent } from "../../events/PluginModuleType";
import getEventTarget from './getEventTarget'
import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree";
import { Fiber } from "../../react-reconciler/ReactFiber";

/**
 * Traps top-level events by using event bubbling.
 * 
 * @param {number} topLevelEvent topLevelType Number from `TopLevelEventTypes`.
 * @param {object} element Element on which to attach listener.
 * @return {?object} An object with a remove function which will forcefully
 *                  remove the listener.
 */
export function trapBubbledEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element,
) {
  if (!element) {
    return null
  }

  // TODO: liuxing
  const dispatch = dispatchEvent


  addEventBubbleListener(
    element,
    getRawEventName(topLevelType),
    // Check if interactive and wrap in interactiveUpdates
    dispatch.bind(null, topLevelType),
  )
}

export function dispatchEvent(
  topLevelType: DOMTopLevelEventType,
  nativeEvent: AnyNativeEvent
) {
  const nativeEventTarget = getEventTarget(nativeEvent);
  let targetInst = getClosestInstanceFromNode(nativeEventTarget)
  if (
    targetInst !== null &&
    typeof targetInst.tag === 'number'
  ) {
    targetInst = null;
  }

  const bookKeeping = getTopLevelCallbackBookKeeping(
    topLevelType,
    nativeEvent,
    targetInst
  )

  try {
    // Event queue being processed in the same cycle allows
    // `preventDefault`.
    // batchedUpdates()
  } finally {

  }
}

function getTopLevelCallbackBookKeeping(
  topLevelType,
  nativeEvent,
  targetInst
): {
  topLevelType?: DOMTopLevelEventType,
  nativeEvent?: AnyNativeEvent,
  targetInst: Fiber | null,
  ancestors: Array<Fiber>,
} {
  return {
    topLevelType,
    nativeEvent,
    targetInst,
    ancestors: []
  }
}