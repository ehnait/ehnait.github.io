---
title: 'ORCA避障算法在CocosCreator中的运用'
excerpt: ''
classes: wide
categories:
  - 前端
tags:
  - CocosCreatorV2.4
---

![rvo.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69bef80de3fb4a49ab59f993d7939084~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

如上图，小怪在移动的过程中做了避障处理，因此小怪在移动中不会重叠在一起。在当前流行的割草系游戏中，常常需要实现大量的小怪，并确保它们之间不会发生重叠的情况。为了解决这个问题，也需要借助避障算法来实现小怪物的自主移动和避障行为。

游戏中常用的避障算法有A星算法和ORCA算法。

* A星算法：广泛应用于单智能体路径规划，具有良好的路径质量和计算效率。使用启发式搜索方法，可以在图形网络中找到最短路径。适用于单智能体的最短路径规划
* ORCA算法：高效性、可扩展性、实时性。通过预测智能体的运动轨迹和计算速度变化集合，能够快速计算出避免碰撞的最优速度。适用于大规模智能体系统，并能够应对即时响应和动态调整的需求。

显然，ORCA算法比较适合大量小怪的避障行为。

### 简介

ORCA(Optimal Reciprocal Collision Avoidance）是由Jur van den
Berg等人于2008年提出的，用于多智能体路径规划和避障。它通过预测智能体的运动轨迹和计算速度变化集合，实现智能体之间的协调移动和避免碰撞。它又叫`RVO2`
算法，之所以多了个`2`，是因为它是`RVO`算法的进阶版，它解决了`RVO`在单对单的避障中几乎总是表现良好，但当智能体的数量增多时，还是会出现不符合预期的现象的问题。

ORCA算法具有以下特点：

* 高效性：ORCA算法通过几何计算和优化方法，能够快速计算出智能体的运动轨迹和速度变化。
* 可扩展性：ORCA算法适用于大规模智能体系统，能够同时处理多个智能体之间的碰撞避免。
* 实时性：ORCA算法是一种实时算法，适用于需要即时响应和动态调整的应用场景。

### 原理

ORCA算法的核心思想是通过预测智能体的运动轨迹，避免与其他智能体发生碰撞，这里简单说下算法的基本原理：

* 碰撞检测：对于每个智能体，首先检测其周围的邻居智能体，并计算与它们的碰撞风险。这可以通过计算智能体之间的最短距离和相对速度来实现。
* 速度变化集合：根据碰撞检测结果，计算出智能体在当前时刻可行的速度变化集合。集合中的速度变化代表了智能体可以采取的不与邻居发生碰撞的速度。
* 优化选择：从速度变化集合中选择一个最优的速度变化，使得智能体能够避免碰撞并尽可能接近其期望的运动方向。
* 更新状态：根据选择的最优速度变化，更新智能体的位置和速度，进入下一个时刻的计算。

### 运用

这里通过一个简单的例子，来展示CocosCreator中使用ORCA算法。

由于作者只提供了算法的C++版本，CS版和JAVA版，因此使用前需要让算法转成javascript版本和typscript，才能在cocoscreator中使用，当然你也可以使用`WebAssembly`
工具链将算法转成`.wasm`
格式，这样可以提高算法的性能，当然这个不属于这里要讨论的范畴，这里将算法转成Typescript版，为了减少篇幅，就不贴转换后的Typescript代码，简单介绍下每个类的作用功能，有兴趣的可以去[github.com/snape/RVO2-…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fsnape%2FRVO2-CS "https://github.com/snape/RVO2-CS")
自己转换。

核心类总共有7个：

1. Agent.ts：
    * 代表游戏场景中的一个智能体。
    * 负责计算智能体的速度和位置，以及与其他智能体之间的碰撞避免。
2. KdTree.ts：
    * 实现了k-d树数据结构，用于加速最近邻搜索。
    * 提供了构建k-d树、查找最近邻、范围搜索等方法。
3. Line.ts：
    * 定义了二维空间中的一条线段。
    * 提供了计算线段交点、线段长度等方法。
4. Obstacle.ts：
    * 代表游戏场景中的一个障碍物。
    * 存储了障碍物的顶点信息和边界。
    * 提供了计算障碍物可见顶点、检测障碍物相交等方法。
5. RVOMath.ts：
    * 提供了一些数学计算的辅助方法。
    * 包括计算向量的长度、点到线段的距离等方法。
6. Simulator.ts：
    * 模拟RVO2算法的运行。
    * 管理代理（Agent）和障碍物（Obstacle），计算碰撞避免的速度调整。
7. Vector2.ts：
    * 实现了二维向量的计算和操作。
    * 提供了向量加减、点积、叉积等基本运算。

#### 创建智体组件

接下来创建一个智体组件`RVOAgent.ts`，它会在每个帧上更新智能体的位置和优先速度，代码如下：

```typescript
/**
 * @description : RVO智能体的组件，它在每个帧上更新智能体的位置和优先速度
 */

import RVOMath from "../RVO/RVOMath";
import Simulator from "../RVO/Simulator";
import Vector2 from "../RVO/Vector2";

const {ccclass} = cc._decorator;

@ccclass
export default class RVOAgent extends cc.Component {
    /** 用于存储智能体的唯一标识符 */
    private _sid: number = -1;
    public set sid(val: number) {
        this._sid = val;
    }

    /** 用于存储目标智能体的标识符 */
    public targetSid: number = -1;
    /** 用于存储目标位置的二维向量 */
    public targetPos: Vector2;

    /** 每个帧上自动调用的函数。在该函数中，根据智能体的标识符 _sid 获取其当前位置和优先速度，并更新智能体节点的位置 */
    update(dt) {
        if (this._sid > -1) {
            let pos: Vector2 = Simulator.Instance.getAgentPosition(this._sid);

            if (!Number.isNaN(pos.x) && !Number.isNaN(pos.y)) {
                this.node.setPosition(pos.x, pos.y);
            } else {
                console.log(`sid=${this._sid}的对象PosX=${pos.x},PosY=${pos.y}`);
            }
        }
        this.updatePrefVelocity();
    }

    /** 更新智能体的优先速度 */
    public updatePrefVelocity() {
        if (this.targetPos != null) {
            let curPos = Simulator.Instance.getAgentPosition(this._sid);
            let targetPos = this.targetPos;

            let goalVector = Vector2.subtract(targetPos, curPos);
            if (RVOMath.absSq(goalVector) > 1) {
                goalVector = RVOMath.normalize(goalVector);
            }
            Simulator.Instance.setAgentPrefVelocity(this._sid, goalVector);
        }
    }
}

```

在编辑器中创建一个spine智体预制体节点, 稍后代码中将`RVOAgent.ts`动态挂载在此节点上，来更新此节点的位置和速度。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3619869238764f38958426936c497145~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

将spine预制体节点的动画设置成走路，并且启用循环模式，让spine节点一直走路

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/246835f582164e0da13a49823d414281~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

#### 创建障碍物组件

创建障碍物组件`RVOObstacle.ts`, 将子节点作为一个矩形障碍物的四个顶点添加到RVO模拟器中，使其参与智能体的导航和避障计算

```typescript
import Simulator from "../RVO/Simulator";
import Vector2 from "../RVO/Vector2";

const {ccclass} = cc._decorator;

@ccclass
export default class RVOObstacle extends cc.Component {

    protected onLoad(): void {
        let childs = this.node.children;
        let node = childs[0];
        let pos = this.node.convertToWorldSpaceAR(node.position);
        pos = this.node.parent.convertToNodeSpaceAR(pos);
        let widthHalf = node.width >> 1;
        let heightHalf = node.height >> 1;
        let minX = pos.x - widthHalf;
        let maxX = pos.x + widthHalf;
        let minY = pos.y - heightHalf;
        let maxY = pos.y + heightHalf;

        let obstacle: Array<Vector2> = [];
        // 将障碍物的右上角顶点坐标添加到障碍物数组中
        obstacle[obstacle.length] = new Vector2(maxX, maxY);
        // 将障碍物的左上角顶点坐标添加到障碍物数组中
        obstacle[obstacle.length] = new Vector2(minX, maxY);
        // 将障碍物的左下角顶点坐标添加到障碍物数组中
        obstacle[obstacle.length] = new Vector2(minX, minY);
        // 将障碍物的右下角顶点坐标添加到障碍物数组中
        obstacle[obstacle.length] = new Vector2(maxX, minY);
        // 将障碍物添加到RVO模拟器实例中
        Simulator.Instance.addObstacle(obstacle);
        // 处理障碍物，使其在RVO模拟器中生效, 这里会创建障碍物的Kd Tree
        Simulator.Instance.processObstacles();
    }
}
```

创建白色矩形障碍物预制体节点

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/091425c589cd4468b5b9010c57ea119f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

并且将`RVOObstacle.ts`挂在在预制体节点上

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76b66461974042098a8b438265ae8dc9~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

#### RVO配置

添加RVO配置，用于初始化RVO系统的配置

```typescript
import Vector2 from "../RVO/Vector2";

export default class RVOConfig {
    /**代理对象总数 */
    public static agentCount = 30;
    /**代理对象之间的距离 */
    public static neighborDist = 80;
    /**代理对象的半径 */
    public static radius = 20;
    /**代理对象的最大移动速度 */
    public static maxSpeed = 200;
    /**代理对象的初始速度 */
    public static velocity = new Vector2(0, 0);
    /**最大邻居数 */
    public static maxNeighbors = 6;
    /**安全单位时间，它乘以最大速度就是agent的避让探针，值越大，就会越早做出避让行为 */
    public static timeHorizon = 25;
    /**与timeHorizon类似，只针对障碍物 */
    public static timeHorizonObst = 5;

    /**步骤帧 */
    public static gameTimeStep = 4;
}
```

#### 游戏管理

添加游戏管理类`GameManager.ts`,负责初始化RVO系统、创建智能体和障碍物，并响应触摸事件改变智能体的终点位置:

```typescript
import Simulator from "../RVO/Simulator";
import Vector2 from "../RVO/Vector2";
import RVOAgent from "./RVOAgent";
import RVOConfig from "./RVOConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    /** 智体预制体 */
    @property(cc.Prefab)
    public agentPrefab: cc.Prefab = null;

    /** 障碍物预制体 */
    @property(cc.Prefab)
    public obstaclePrefab: cc.Prefab = null;

    /** 智体映射表 */
    private _agentMap: { [sid: number]: RVOAgent } = {};

    start() {
        /** 通过触摸事件改变智体的终点位置 */
        this.node.on(cc.Node.EventType.MOUSE_MOVE, this.changeDestPos, this);

        this.initRVO();

        this.createAgents();
        this.addObstacle();
    }

    /** 初始化RVO系统 */
    private initRVO() {
        /** 代表每个动态对象在进行运动预测时所使用的时间步长 */
        Simulator.Instance.setTimeStep(RVOConfig.gameTimeStep);
        /** 设置 Simulator的参数数据*/
        Simulator.Instance.setAgentDefaults(RVOConfig.neighborDist, RVOConfig.maxNeighbors,
            RVOConfig.timeHorizon, RVOConfig.timeHorizonObst,
            RVOConfig.radius, RVOConfig.maxSpeed, RVOConfig.velocity);
    }

    protected update(dt: number): void {
        // 执行一步模拟，更新智能体的邻居关系、计算新速度和更新位置
        Simulator.Instance.doStep();
    }

    /** 将创建好的智体放入到映射表中，并设置智体的终点 */
    private createAgents() {
        let center = cc.v2(0, 0);
        let agentNum = RVOConfig.agentCount;
        let radius = 200;

        /** 将创建好的智体位置评分分配到直径为200的圆上，并将朝向执行屏幕中心点 */
        for (let i = 0; i < agentNum; i++) {
            let v2 = this.getPosInCircle(360 / agentNum * i, radius, center);
            let sid = this.createAgent(v2);
            let ga = this._agentMap[sid];
            ga.targetPos = cc.v2(0, 0);
            ga.node.scaleX = ga.node.x < ga.targetPos.x ? -1 : 1;
        }
    }

    /** 创建智体 */
    private createAgent(position: Vector2) {
        if (!this.agentPrefab) return;
        let sid = Simulator.Instance.addAgent(position);

        if (sid > -1) {
            let node = cc.instantiate(this.agentPrefab);
            node.name = "agent_" + sid;
            this.node.parent.addChild(node);
            node.setPosition(position.x, position.y);

            // 动态添加RVOAgen组件到智体节点上
            let ga = node.getComponent(RVOAgent) || node.addComponent(RVOAgent);
            ga.sid = sid;

            this._agentMap[sid] = ga;
        }
        return sid;
    }

    /** 在屏幕中间间隔创建4个障碍物 */
    private addObstacle() {
        let parent = this.node.parent;
        const size = cc.winSize;
        for (let i = 0; i < 4; i++) {
            let node = cc.instantiate(this.obstaclePrefab);
            node.x = i % 2 === 0 ? -100 : 100;
            node.y = i > 1 ? 100 : -100;
            parent.addChild(node);
        }
    }

    /** 改变智体的终点位置，终点为触摸点的位置 */
    private changeDestPos(event: cc.Event.EventMouse) {

        let parent = this.node.parent;
        const pos = parent.convertToNodeSpaceAR(event.getLocation());
        // 遍历 this._agentMap
        Object.keys(this._agentMap).forEach((sid: string) => {
            const agent: RVOAgent = this._agentMap[sid];
            agent.targetPos = pos;
            //设置智体的朝向，让智体spine朝向指向终点
            agent.node.scaleX = agent.node.x < pos.x ? -1 : 1;
        });
    }

    /**
     * 求圆上某角度的点的坐标
     */
    private getPosInCircle(angle: number, radius: number, center: cc.Vec2) {
        let x = Math.floor(center.x + radius * Math.cos(angle * Math.PI / 180));
        let y = Math.floor(center.y + radius * Math.sin(angle * Math.PI / 180));

        return new Vector2(x, y);
    }
}
```

将`GameManager.ts`挂载在场景中的节点上

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5d7042305c44f36950af82eda9d10f1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)
点击执行按钮，就可以看到开头的效果。

ORCA避障算法为游戏开发者提供了一种实现智能体避障行为的有效方法。通过合理地应用ORCA算法，我们能够创建更具挑战性和真实感的游戏场景，增强玩家的游戏体验。

### 注意事项：

* 约束预测时间步长：ORCA算法是基于一定的预测时间步长进行运算的。确保你选择的预测时间步长足够大以允许足够的反应时间来避免碰撞。
* 处理多个邻居代理：ORCA算法通常用于多个运动代理的场景。确保在计算邻居代理时选择正确的半径和邻居数量，以便能够正确考虑周围的代理，并进行适当的碰撞避免决策。
* 调整预测冲突的优化：ORCA算法可能会面临预测冲突的情况，即多个代理预测到彼此的碰撞。可以通过调整优化策略或使用辅助规则来处理这种情况，以确保代理能够正确地避免碰撞。
* 考虑动态目标点：如果代理的目标点是动态变化的，需要及时更新并重新计算代理的速度和避免决策，以适应新的目标点。
* 调整参数和调试：ORCA算法涉及一些参数，如预测时间步长、邻居半径等。根据场景的需要，可能需要进行参数调整和调试，以获得最佳的碰撞避免效果。

这些是使用ORCA算法时需要考虑的一些重要注意事项。正确地理解和应用这些注意事项可以帮助确保代理能够安全、高效地避免碰撞，并在复杂的运动场景中表现良好。

参考资料：

* [ORCA: Collision Avoidance for Interactive Agents](https://link.juejin.cn?target=https%3A%2F%2Fgamma.cs.unc.edu%2FORCA%2F "https://gamma.cs.unc.edu/ORCA/")
* [github.com/snape/RVO2-…](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fsnape%2FRVO2-CS "https://github.com/snape/RVO2-CS")
