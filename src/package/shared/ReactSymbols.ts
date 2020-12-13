// Symbol 用来判断 ReactElement 的类型
// 如果没有原生的 Symbol 用数字代替
const hasSymbol = typeof Symbol === 'function' && Symbol.for

export const REACT_ELEMENT_TYPE = hasSymbol
  ? Symbol.for('react.element')
  : 0xeac7;

export const REACT_PORTAL_TYPE = hasSymbol
  ? Symbol.for('react.portal')
  : 0xeaca;

export const REACT_FRAGMENT_TYPE = hasSymbol
  ? Symbol.for('react.fragment')
  : 0xeacb;