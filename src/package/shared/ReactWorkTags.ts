export type WorkTag =
  0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18;

export const FunctionComponent = 0;
export const ClassComponent = 1; // 表示类组件的类型
export const IndeterminateComponent = 2; //在事先不知道是函数组件或者class组件
export const HostRoot = 3; // 标示 rootFiber类型

export const HostComponent = 5; // 表示原生dom类型
export const HostText = 6; // 表示文本类型
export const Fragment = 7;