import { Namespaces } from "../../shared/DOMNamespaces"

// SVG temp container for IE lacking innerHTML
let reusableSVGContainer;

/**
 * Set the innerHTML property of a node
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
const setInnerHTML = function(
  node: Element,
  html: string
): void {
  if (node.namespaceURI === Namespaces.svg && !('innerHTML' in node)) {
    // reusableSVGContainer = 
    //   reusableSVGContainer || document.createElement('div')
    // reusableSVGContainer.innerHTML = '<svg>' + html + '</svg>'
    // const svgNode = reusableSVGContainer.firstChild;

    // while(node.firstChild) {
    //   node.removeChild(node.firstChild);
    // }

    // while (svgNode.firstChild) {
    //   node.appendChild(svgNode.firstChild);
    // }
  } else {
    node.innerHTML = html;
  }
}

export default setInnerHTML;