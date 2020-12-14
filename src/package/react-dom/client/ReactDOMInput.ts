import { ToStringValue } from "./ToStringValue";


/**
 * Implements an <input> host component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * See http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */
type InputWithWrapperState = HTMLInputElement & {
  _wrapperState: {
    initialValue: ToStringValue,
    initialChecked?: boolean,
    controlled?: boolean,
  },
};

 export function getHostProps(element: Element, props: Object) {
   const node = element as InputWithWrapperState
   // TODO: liuxing
  //  const checked = props.checked;
  const checked = false;

   const hostProps = Object.assign({}, props, {
      defaultChecked: undefined,
      defaultValue: undefined,
      value: undefined,
      checked: checked !== null ? checked : node._wrapperState.initialChecked
   })

   return hostProps
 }