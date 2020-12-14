export type SideEffectTag = number

export const NoEffect = 0b000000000000; // 当前节点无任何工作

export const PerformedWork = 0b000000000001;

export const Placement = 0b000000000010; // 表示这个节点是新插入的
export const Update = 0b000000000100; // 表示当前节点有更新
export const PlacementAndUpdate = 0b000000000110; // 一般是节点换位置同时更新了
export const Deletion =  0b000000001000; // 表示当前节点要被删除

export const Incomplete = /*            */ 0b010000000000;