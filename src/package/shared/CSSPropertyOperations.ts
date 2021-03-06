/**
 * Sets the value for multiple styles on a node.  If a value is specified as
 * '' (empty string), the corresponding style property will be unset.
 * 
 * @param {DOMElement} node 
 * @param {object} styles 
 */
export function setValueForStyles(node, styles) {
  const style = node.style
  for(let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue
    }

    const isCustomProperty = styleName.indexOf('--') === 0;

    const styleValue = 
  }
}