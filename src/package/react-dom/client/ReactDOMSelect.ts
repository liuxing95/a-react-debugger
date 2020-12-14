export function getHostProps(element: Element, props: Object) {
  return Object.assign({}, props, {
    value: undefined,
  });
}