---
title: 'Cocos Creator v2.4 的 ClickUtils'
excerpt : "点击事件的工具类"
categories:
  - CocosCreator v2.4
tags:
  - utils

---

## ClickUtils.js

```javascript
/**
 * add a TOUCH event
 * Note: In this way, you can't get the touch event info, so use it wisely.
 * @param node
 * @param callBack
 */
const nodeTouchEvent = (node, callBack) => {
        if (!node || node.hasEventListener(cc.Node.EventType.TOUCH_END)) return;
        node.on(cc.Node.EventType.TOUCH_END, (event) => {
            event.stopPropagation();
            //This is a callback after the trigger event
            callBack && callBack(event);
        });
    };
/**
 * You could also add a click event
 * The event is a custom event, you could get the Button component via first argument
 * Note: In this way, you can't get the touch event info, so use it wisely.
 * @param node
 * @param callBack
 */
const buttonClickEvent = (node, callBack) => {
    if (!node || node.hasEventListener("click")) return;
    node.on("click", (button) => {
        // event.stopPropagation();
        //The event is a custom event, you could get the Button component via first argument
        callBack && callBack(button);
    });

};

module.exports = {
    nodeTouchEvent,
    buttonClickEvent,
};
```

## 使用

```javascript
const ClickUtils = require("ClickUtils");
ClickUtils.buttonClickEvent(chipNode, (button) => {
    //do  sth
});
ClickUtils.nodeTouchEvent(child, (event) => {
    //do  sth
});
```