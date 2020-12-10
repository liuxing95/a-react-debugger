import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'

// packages/react/src/ReactElement.js

function ReactElement(type, key, props) {
  let element = {
    $$typeof: REACT_ELEMENT_TYPE, // 标示为虚拟dom
    type, // type: 'div' | type function 类型的 Avator
    key,
    props // props 中包含了 children
  }
  return element
}

function createElement(type, props = {}, children) {
  let _props = Object.assign({}, props)
  // @ts-ignore
  let _key = _props.key || null
  let children_length = children.length
  // @ts-ignore
  _props.children = children_length === 0 ? null : children_length === 1 ? children[0] : children
  return ReactElement(type, _key, _props)
}

class Component {
  constructor(props, context, updater) {
    this.props = props
    this.context = context
    this.updater = updater || null
  }

  get isReactComponent() {
    return true
  }

  // @ts-ignore
  static getDerivedStateFromProps(nextProps, prevState) {
    // if (nextProps.source !== prevState.source) {
    //   return {
    //     source: nextProps.source,
    //     value:
    //       nextProps.source != null
    //         ? getCurrentValue(nextProps.source)
    //         : undefined,
    //   };
    // }

    // return null;
  }

  setState(partialState, callback) {
    if (partialState instanceof Object || typeof partialState === 'function') {
      let _setState = this.updater.enqueueSetState
      _setState && _setState(this, partialState, callback, 'setState')
    }
  }
}

const React = {
  createElement: function(type, props, ...children) {
    let element = createElement(type, props, children)
    return element
  },
  Component
}

export default React