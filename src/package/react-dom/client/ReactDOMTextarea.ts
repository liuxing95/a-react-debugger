import { ToStringValue, toString } from "./ToStringValue";

type TextAreaWithWrapperState = HTMLTextAreaElement & {
  _wrapperState: {
    initialValue: ToStringValue,
  },
};
/**
 * Implements a <textarea> host component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */

export function getHostProps(element: Element, props: Object) {
  const node = element as TextAreaWithWrapperState

  // Always set children to the same thing. In IE9, the selection range will
  // get reset if `textContent` is mutated.  We could add a check in setTextContent
  // to only set the value if/when the value differs from the node value (which would
  // completely solve this IE9 bug), but Sebastian+Sophie seemed to like this
  // solution. The value can be a boolean or object so that's why it's forced
  // to be a string.
  const hostProps = {
    ...props,
    value: undefined,
    defaultValue: undefined,
    children: toString(node._wrapperState.initialValue),
  };

  return hostProps;
}