"use strict";
exports.__esModule = true;
exports.dispatchUpdate = exports.render = void 0;
var currentFiber;
var finish = null;
var deletes = [];
exports.render = function (vnode, node, done) {
    var rootFiber = {
        node: node,
        props: { children: vnode },
        done: done
    };
    // 触发更新
    // 从 rootFiber 开始
    exports.dispatchUpdate(rootFiber);
};
exports.dispatchUpdate = function (fiber) {
    // 如果fiber存在 并且fiber.lane 存在 LANE.DIRTY
    if (fiber && !(fiber.lane & 32 /* DIRTY */)) {
        fiber.lane = 2 /* UPDATE */ | 32 /* DIRTY */;
    }
};
