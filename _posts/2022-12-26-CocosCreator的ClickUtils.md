---
title: 'Cocos Creator v2.4 的 ClickUtils'
excerpt : "点击事件的工具类"
categories: CocosCreator v2.4
tags: CocosCreator v2.4
---

## ClickUtils.js

```javascript
/**
 * add a TOUCH event
 * Note: In this way, you can't get the touch event info, so use it wisely.
 * @param node
 * @param callBack
 * @param type cc.Node.EventType
 */
const nodeTouchEvent = (node, callBack, type = cc.Node.EventType.TOUCH_END) => {
        if (!node) return;
        node.on(type, (event) => {
            event.stopPropagation();
            //This is a callback after the trigger event
            callBack && callBack(event);
        });
    };
const nodeOnceTouchEvent = (node, callBack, type = cc.Node.EventType.TOUCH_END) => {
    if (!node) return;
    node.once(type, (event) => {
        event.stopPropagation();
        //This is a callback after the trigger event
        callBack && callBack(event);
    });
};

const nodeDebounceTouchEvent = (node, callBack, debounceTime = 3000) => {
    if (!node) return;
    node.on(cc.Node.EventType.TOUCH_END, (event) => {
        let curTime = new Date().getTime();
        if (!node._lastClickTime || curTime - node._lastClickTime > debounceTime) {
            node._lastClickTime = curTime;
            event.stopPropagation();
            //This is a callback after the trigger event
            callBack && callBack(event);
        }
    });
};

/**
 * You could also add a click event
 * The event is a custom event, you could get the Button component via first argument
 * Note: In this way, you can't get the touch event info, so use it wisely.
 * @param node
 * @param callBack
 * @param debounceTime
 */
const buttonClickEvent = (node, callBack, debounceTime = 300) => {
    if (!node) return;
    node.on("click", (button) => {
        let curTime = new Date().getTime();
        if (!node._lastClickTime || curTime - node.lastClickTime > debounceTime) {
            node._lastClickTime = curTime;
            //The event is a custom event, you could get the Button component via first argument
            callBack && callBack(button);
        }
    });
};

export {
    nodeTouchEvent,
    nodeOnceTouchEvent,
    nodeDebounceTouchEvent,
    buttonClickEvent,
};

```

## 使用

```javascript
import {nodeTouchEvent} from "./ClickUtils";

nodeTouchEvent(shopBtn, (event) => {
    //do  sth
}, cc.Node.EventType.TOUCH_END);

```