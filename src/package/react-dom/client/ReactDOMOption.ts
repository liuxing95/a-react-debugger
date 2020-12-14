import React from '../../react/react';
function flattenChildren(children) {
  let content = '';

  // Flatten children. We'll warn if they are invalid
  // during validateProps() which runs for hydration too.
  // Note that this would throw on non-element objects.
  // Elements are stringified (which is normally irrelevant
  // but matters for <fbt>).
  React.Children.forEach(children, function(child) {
    if (child == null) {
      return;
    }
    content += child;
    // Note: we don't warn about invalid children here.
    // Instead, this is done separately below so that
    // it happens during the hydration codepath too.
  });

  return content;
}


export function getHostProps(element: Element, props: Object) {
  const hostProps = {children: undefined, ...props};
  // const content = flattenChildren(props.children);

  // if (content) {
  //   hostProps.children = content;
  // }

  return hostProps;
}
