---
title: 'Cocos Creator 常用动画'
excerpt: ''
classes: wide
categories:
  - 前端
tags:
  - CocosCreatorV2.4
---
### 按钮跳动

```ts
//设置缩放
static danceBtnByScale(node: cc.Node, duration: number = 1) {
    cc.tween(node)
      .repeatForever(cc.tween().to(duration, { scale: 1.05 }, { easing: "elasticOut" }).to(duration, { scale: 0.95 }, { easing: "elasticIn" }))
      .start();
} 
//设置缩放
static danceBtnByScaleX(node: cc.Node, duration: number = 0.2) {
    cc.tween(node)
      .repeatForever(cc.tween().to(duration, { scaleX: 0.8, scaleY: 1.1 }).to(duration, { scaleX: 1, scaleY: 1 }).to(0.09, { scaleX: 0.95, scaleY: 1.05 }).to(0.09, { scaleX: 1, scaleY: 1 }).delay(0.8))
      .start();
}
//设置角度
static danceBtnByAngle(node: cc.Node, angle: number = 15) {
    cc.tween(node)
      .repeatForever(cc.tween().to(0.1, { angle: angle }).to(0.2, { angle: -angle }).to(0.1, { angle: 0 }).to(0.1, { angle: angle }).to(0.2, { angle: -angle }).to(0.1, { angle: 0 }).delay(1.5))
      .start();
}
```

### 手势点击动画

```ts
//旋转加位移
static handGuideRotate(node: cc.Node, duration: number = 0.8) {
    cc.tween(node)
      .repeatForever(cc.tween().by(duration, { x: 20, y: 20, angle: -10 }, { easing: "smooth" }).by(duration, { x: -20, y: -20, angle: 10 }, { easing: "smooth" }))
      .start();
}
//纯位移
static handGuideVertical(node: cc.Node, duration: number = 0.8, direcion: string = "vertical", distance: number = 50) {
    let action = null;
    if (direcion === "vertical") {
      action = cc.tween().by(duration, { y: distance }, { easing: "smooth" }).by(duration, { y: -distance }, { easing: "smooth" });
    } else {
      action = cc.tween().by(duration, { x: distance }, { easing: "smooth" }).by(duration, { x: -distance }, { easing: "smooth" });
    }
    cc.tween(node).repeatForever(action).start();
}
//快速点击
static fastClick(node: cc.Node, duration: number = 0.8) {
    cc.tween(node)
      .repeatForever(cc.tween().by(duration, { scale: 0.1 }, { easing: "smooth" }).by(duration, { scale: -0.1 }, { easing: "smooth" }))
      .start();
}
```

### 垂直翻转

```ts
static flipY(node: cc.Node, duration: number = 0.2, sprite: cc.SpriteFrame) {
    let t = cc.tween;
    t(node)
      .to(duration, { scaleX: 0, scaleY: 1 })
      .call(() => {
        node.getComponent(cc.Sprite).spriteFrame = sprite;
      })
      .to(duration, { scaleX: 1, scaleY: 1 })
      .start();
}
```

### 背景光旋转

```ts
static lightRotate(node: cc.Node, angle: number = 360, duration: number = 5) {
    cc.tween(node).by(duration, { angle: angle }).repeatForever().start();
}
```

### 渐隐 渐显

```ts
static hide(node: cc.Node, cb: Function = () => { }, duration: number = 0.5) {
    node.active = true;
    node.opacity = 25 5;
    cc.tween(node).to(duration, { opacity: 0 }, { easing: "fade" }).call(cb).start();
}
static show(node: cc.Node, cb: Function, duration: number = 0.5) {
    node.active = true;
    node.opacity = 0;
    cc.tween(node).to(duration, { opacity: 255 }, { easing: "fade" }).call(cb).start();
}
```
