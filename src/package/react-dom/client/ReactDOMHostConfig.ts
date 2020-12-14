import { diffProperties } from './ReactDOMComponent'
export type Type = string
export type Props = {
  autoFocus?: boolean,
  children?: any,
  hidden?: boolean,
  suppressHydrationWarning?: boolean,
  dangerouslySetInnerHTML?: any,
  style?: {
    display?: string,
  },
}
export type Container = Element | Document;
export type Instance = Element;
export type TextInstance = Text;
export type SuspenseInstance = Comment;
export type HydratableInstance = Instance | TextInstance | SuspenseInstance;
export type PublicInstance = Element | Text;
type HostContextDev = {
  namespace: string,
  ancestorInfo: any,
};
type HostContextProd = string;
export type HostContext = HostContextDev | HostContextProd;
export type UpdatePayload = Array<any>;
export type ChildSet = void; // Unused
// export type TimeoutHandle = TimeoutID;
export type NoTimeout = -1;
export function prepareUpdate(
  domElement: Instance,
  type: string,
  oldProps: Props,
  newProps: Props,
  rootContainerInstance: Container
): null | Array<any> {
  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance
  )
}