---
title: 'Cocos Creator v2.4 的 JS脚本模块化'
excerpt : "点击事件的工具类"
categories: CocosCreatorV2.4
tags: CocosCreatorV2.4
---

## 前言

模块化使你可以在 Cocos Creator 中引用其它脚本文件, 结合单例模式可以快速访问

### App.js

```javascript
import XXXCtrl from "./XXXCtrl";
import Main from "./Main";

cc.Class({
    extends: cc.Component,
    onLoad() {
        this.node.addComponent(XXXCtrl);
        this.node.addComponent(Main);
    },
});

```

### Base.js

```javascript
// Base.js
const Base = cc.Class({
    extends: cc.Component,
    onLoad() {
        cc.log("base onLoad");
    },
    xxx() {
        cc.log("xxx");
    },

});

export default Base;

```

### XXXCtrl.js

```javascript

const XXXCtrl = cc.Class({
    extends: Base,
    statics: {
        Instance: null,
    },
    _singleton() {
        if (XXXCtrl.Instance === null) {
            XXXCtrl.Instance = this;
        }
    },
    onLoad() {
        this._singleton();
    },
    onDestroy() {
        XXXCtrl.Instance = null;
    },
    ooo() {
        cc.log("ooo");
    },
});

export default XXXCtrl;

```

### Main.js

```javascript
import Base from "./Base";
import Base from "./XXXCtrl";

const Main = cc.Class({
    extends: Base,
    statics: {
        Instance: null,
    },
    _singleton() {
        if (Main.Instance === null) {
            Main.Instance = this;
        }
    },
    onLoad() {
        cc.log("main onLoad");
        this._super();/*和构造函数不同的是，父类被重写的方法并不会被 CCClass 自动调用，如果你要调用的话使用 CCClass 封装的 this._super*/
        this._singleton();
        Base.prototype.xxx.call(this);//调用父类的方法
        XXXCtrl.Instance.ooo();//调用XXXCtrl类的方法
    },
    onDestroy() {
        this._super();
        Main.Instance = null;
    },
});

export default Main;

```

## 使用

App.js作为整个脚本的入口，挂载到节点上

![20230209_1.png](/assets/images/20230209_1.png)
