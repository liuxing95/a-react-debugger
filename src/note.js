// fiber: 就是一个数据结构 他有很多属性
// 虚拟dom就是对真实dom的一种简化
// 一些真实dom都做不到的事情 那 虚拟dom更做不到
// 就有了fiber 有很多属性 希望借助 fiber的这堆属性
// 来做一些比较厉害的事情


// fiber架构
// react 更新 一把梭 的状态  占用主线程很长时间
// 为了弥补一些不足 就设计了一些新的算法
// 而 为了能让这些算法跑起来 所以出现了 fiber 这种数据结构
// fiber 这种数据数据结构 + 新的算法 = fiber架构

// react 应用从始至终 管理者最基本的三样东西
// 1. Root（整个应用的根， 一个对象 不是fiber 有个属性指向current树  同样也有属性指向 workInProgress 树 ）
// 2. current树（树上的每一个节点都是fiber  保存的是上一次的状态   并且每个fiber节点 都对应着一个jsx节点）
// 3. workInProgress树 （树上的每一个节点都是fiber  保存的是 新的状态   并且每个fiber节点都对应一个jsx节点）


// 初次渲染的时候  没有current树
// react 在一开始创建 Root 就会同时创建一个 unInitialFiber  的东西 （未初始化的 fiber）
// 让 react 的current 指向了 unInitialFiber
// 之后 再去创建一个本次要用到的 workInProgress树

// react 主要分两个阶段
// render 阶段 （指的是 创建 fiber 的过程 ）
// 1.  为每个节点创建新的fiber （workInProgress）（可能是复用）生成一颗有新状态的 workInprogress树
// 2.  初次渲染的时候（或新创建某个节点的时候） 会将这个fiber 创建真实的dom实例 （并不会真实插入到页面上） 并且对当前节点的子节点进行插入append
// 3.  如果不是初次渲染的话 就对比 新旧 fiber的状态 将产生了更新的fiber节点 最终通过链表的形式 挂载到RootFiber


// 不管是初次渲染 还是 setState 每次都是从root开始遍历



// commit阶段
// 才是真正操作页面的阶段
// 1.  执行snapShot 生命周期
// 2.  会从 RootFiber 获取到这条链表 根据链表上的标示 来操作页面
// 3.  执行其他的生命周期


// setState 更新是同步的还是异步的
// 如果是正常情况下，如果没有使用 Concurrent 组件的情况下 是同步更新的
// 但是不会立即获取到最新的state的值 因为调用setState 只是但是单纯的将你传进来的
// 新的state放到 updateQueue 这条链表上 等这个点击事件结束之后 会触发内部的一个回调函数
// 在这个回调函数中 才会真正的更新state以及重新渲染

// 当使用了 Concurrent 组件的时候 这种情况下才是真正的异步更新模式
// 同样的没法立即获取最新状态， 并且在执行react的更新和渲染的过程中
// 使用了真正的异步方式（postMessage） 这个才是真正的异步

// flushSync() 
// flushSync(() => {
//   this.setState({
//     a: xxx
//   })
// })
// 当使用了 flushSync 这个API的时候 react的更新渲染完全是同步的
// 会立即触发更新state并处触发渲染过程
// 这种情况可以获取到最新的状态