---
title: 'Cocos Creator v2.4 的 i18n 游戏多语言支持'
excerpt: " "
categories:
  - 前端
tags:
  - CocosCreatorV2.4
---

## 前言

游戏多语言支持是通过 Cocos Creator 编辑器扩展插件实现的，通过查看官方文档发现Cocos Creator v3.x 以后提供了全新扩展插件，但是v2.x
目前暂时没有人力维护。

通过查看插件源码并结合文档，修改并且实现了一个可用的国际化 Label 和 Sprite 组件。

- [i18n 游戏多语言支持](https://docs.cocos.com/creator/2.4/manual/zh/advanced-topics/i18n.html?h=i18n)
- [cocos creator 使用i18n多语言探索](https://www.jianshu.com/p/c73936c1e757)
-

## 支持

- 国际化
- 本地化
- 动态切换语言

多语言国际化和本地化的区别是：国际化需要软件里包括多种语言的文本和图片数据，并根据用户所用设备的默认语言或菜单选择来进行实时切换。而本地化是在发布软件时针对某一特定语言的版本定制文本和图片内容
{: .notice--info}

## 导入

在assets的目录下新建一个名叫 i18n 的文件夹，将[demo示例](#demo示例)中i18n对内容拷贝过去

![20221207_1.png](/assets/images/20221207_1.png)

在data文件夹中为每种语言添加一个相应的 JavaScript 文件，作为键值映射数据。数据文件名应该和语言的代号一致，如 en.js
对应英语映射数据。
{: .notice--info}

## How

LocalizedLabel.js和LocalizedSprite.js（**支持精灵图**）是继承cc.Label和cc.Component的组件，所以需要在Cocos
Creator中进行绑定，像这样：

![20221207_2.png](/assets/images/20221207_2.png)

![20221207_3.png](/assets/images/20221207_3.png)

## 关于 i18n.js

这是i18n的初始化配置类,需要对[Polyglot](https://github.com/airbnb/polyglot.js)进行初始化，提供了以下方法:

- init() 运行时切换语言
- t() 将Key作为输入，并返回本地化的字符串
- currentLocale() 获取当前语言
- updateSceneRenderers()  动态切换语言，这需要遍历Scene下的所有节点 不建议使用

## 预览

![20221207_4.gif](/assets/images/20221207_4.gif)

## demo示例

*<https://github.com/ehnait/CocosCreatorProjects/tree/main/i18n>*