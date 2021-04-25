import { Attributes, FC, FreNode, IFiber, PropsWithChildren, FreElement } from './type'
import { some, isStr } from './reconciler'

export function createText(vnode: string) {
  return { type: 'text', props: { nodeValue: vnode } } as FreElement
}

export function Fragment(props) {
  return props.children
}

export const isArr = Array.isArray