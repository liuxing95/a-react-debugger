import { Attributes, DOM, IFiber } from './type'
import { isStr, LANE } from './reconciler'

// 属性更新
export const updateElement = <P extends Attributes>(
  dom: DOM,
  oldProps: P,
  newProps: P
) => {
  // 遍历新老属性的交集
  for (let name in { ...oldProps, ...newProps }) {
    let oldValue = oldProps[name]
    let newValue = newProps[name]

    if (oldValue === newValue || name === 'children') {

    } else if (name === 'style' && !isStr(newValue)) {
      // 属性名为 style 并且 newValue 不是字符串
      for(const k in { ...oldValue, ...newValue}) {
        // 如果style 对象里面某个 样式名是发生变化的
        if (!(oldValue && newValue && oldValue[k] === newValue[k])) {
          ;(dom as any)[name][k] = newValue[k] || ""
        }
      }
    } else if (name[0] === 'o' && name[1] === 'n') {
      // 绑定事件系列的处理
      // name: onClick => click
      name = name.slice(2).toLowerCase() as Extract<keyof P, string>
      dom.addEventListener(name, newValue)
    } else if (name in dom && !(dom instanceof SVGElement)) {
      ;(dom as any)[name] = newValue||''
    } else if (newValue === null || newValue === undefined || newValue === false) {
      // newValue 不存在 意味着老的属性需要删掉
      dom.removeAttribute(name)
    } else {
      // 设置新属性
      dom.setAttribute(name, newValue)
    }
  }
}

export const createElement = <P = Attributes>(fiber: IFiber) => {
  const dom = 
    fiber.type === 'text'
    ? document.createTextNode("")
    : fiber.lane & LANE.SVG
    ? document.createElementNS(
        "http://www.w3.org/2000/svg",
        fiber.type as string
      )
    : document.createElement(fiber.type as string)
  updateElement(dom as DOM, {} as P, fiber.props as P)
  return dom
}