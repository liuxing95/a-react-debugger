import {
  // initWrapperState as ReactDOMInputInitWrapperState,
  getHostProps as ReactDOMInputGetHostProps,
  // postMountWrapper as ReactDOMInputPostMountWrapper,
  // updateChecked as ReactDOMInputUpdateChecked,
  // updateWrapper as ReactDOMInputUpdateWrapper,
  // restoreControlledState as ReactDOMInputRestoreControlledState,
} from './ReactDOMInput';
import {
  getHostProps as ReactDOMOptionGetHostProps,
  // postMountWrapper as ReactDOMOptionPostMountWrapper,
  // validateProps as ReactDOMOptionValidateProps,
} from './ReactDOMOption';

import {
  // initWrapperState as ReactDOMSelectInitWrapperState,
  getHostProps as ReactDOMSelectGetHostProps,
  // postMountWrapper as ReactDOMSelectPostMountWrapper,
  // restoreControlledState as ReactDOMSelectRestoreControlledState,
  // postUpdateWrapper as ReactDOMSelectPostUpdateWrapper,
} from './ReactDOMSelect';

import {
  // initWrapperState as ReactDOMTextareaInitWrapperState,
  getHostProps as ReactDOMTextareaGetHostProps,
  // postMountWrapper as ReactDOMTextareaPostMountWrapper,
  // updateWrapper as ReactDOMTextareaUpdateWrapper,
  // restoreControlledState as ReactDOMTextareaRestoreControlledState,
} from './ReactDOMTextarea';

const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
const SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
const SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning';
const AUTOFOCUS = 'autoFocus';
const CHILDREN = 'children';
const STYLE = 'style';
const HTML = '__html';

// Calculate the diff between the two objects.
export function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: Object,
  nextRawProps: Object,
  rootContainerElement: Element | Document,
): null | Array<any> {
  let updatePayload: null | Array<any> = null

  let lastProps: Object;
  let nextProps: Object
  switch(tag) {
    case 'input': 
      lastProps = ReactDOMInputGetHostProps(domElement, lastProps)
      nextProps = ReactDOMInputGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'option':
      lastProps = ReactDOMOptionGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMOptionGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'select':
      lastProps = ReactDOMSelectGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMSelectGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'textarea':
      lastProps = ReactDOMTextareaGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMTextareaGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      // if (
      //   typeof lastProps.onClick !== 'function' &&
      //   typeof nextProps.onClick === 'function'
      // ) {
      //   //TODO
      // }
      break;
  }

  let propKey;
  let styleName;
  let styleUpdates = null;
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] === null
    ) {
      continue
    }
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      for(styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {}
          }
          styleUpdates[styleName] = ''
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
      // Noop. This is handled by the clear text mechanism.
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
      // Noop
    } else if (propKey === AUTOFOCUS) {
      // Noop. It doesn't work on updates anyway.
    } else {
      // For all other deleted properties we add it to the queue. We use
      // the whitelist in the commit phase instead.
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }

  for(propKey in nextProps) {
    const nextProp = nextProps[propKey]
    const lastProp = lastProps !== null ? lastProps[propKey] : undefined;
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp === null && lastProp === null)
    ) {
      continue
    }
    if (propKey === STYLE) {
      if (lastProp) {
        // Unset styles on `lastProp` but not on `nextProp`.
        for(styleName in lastProp) {
          if (
            lastProps.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if(!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = ''
          }
        }
        // update styles that changed since `lastProp`
        for(styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        // Relies on `updateStylesByID` not mutating `styleUpdates`.
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = []
          }
          updatePayload.push(propKey, styleUpdates)
        }
        styleUpdates = nextProp;
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined
      const lastHtml = lastProp ? lastProp[HTML] : undefined
      if (nextHtml !== null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, '' + nextHtml);
        }
      } else {
        // TODO: It might be too late to clear this if we have children
        // inserted already.
      }
    } else if (propKey === CHILDREN) {
      if (
        lastProp !== nextProp &&
        (typeof nextProp === 'string' || typeof nextProp === 'number')
      ) {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
      }
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
      // Noop
    } 
    // else if (registrationNameModules.hasOwnProperty(propKey)) {
    //   if (nextProp != null) {
    //     // We eagerly listen to this even though we haven't committed yet.
    //     if (__DEV__ && typeof nextProp !== 'function') {
    //       warnForInvalidEventListener(propKey, nextProp);
    //     }
    //     ensureListeningTo(rootContainerElement, propKey);
    //   }
    //   if (!updatePayload && lastProp !== nextProp) {
    //     // This is a special case. If any listener updates we need to ensure
    //     // that the "current" props pointer gets updated so we need a commit
    //     // to update this element.
    //     updatePayload = [];
    //   }
    // } 
    else {
      // For any other property we always add it to the queue and then we
      // filter it out using the whitelist during the commit.
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }

  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}