import { getPropertyInfo } from "../../shared/DOMProperty";

/**
 * Sets the value for a property on a node.
 *
 * @param {DOMElement} node
 * @param {string} name
 * @param {*} value
 */
export function setValueForProperty(
  node: Element,
  name: string,
  value: any,
  isCustomComponentTag: boolean,
) {
  const propertyInfo = getPropertyInfo(name)
  
}