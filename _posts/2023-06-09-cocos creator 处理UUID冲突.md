---
title: 'cocos creator 处理UUID冲突'
excerpt: ''
classes: wide
categories:
  - 前端
tags:
  - CocosCreatorV2.4
---

*Hi! Everybody*

最近做分支工具，涉及到获取其他分支的某些内容到当前分支来，大概率会造成uuid的冲突。

之前做棋牌的时候，会有复制出来一份子游戏来改的需求，当时也是需要替换下uuid，并把引用的uuid改为复制出来的资源的uuid。

现在把它做成了一个小插件来用，分享给大家。

目的：解决uuid冲突并保留对资源、脚本的引用。

首先咱们会用到一个node-uuid的npm包，主要是用来生成uuid的，用其他方式也可以。

关于uuid我们主要就是生成、判断格式还有和base64的转换。

然后就可以开始我们的逻辑了，主要就是两部分：

一、建立目录中所有meta文件中uuid和新生成uuid的映射关系
二、替换目录中指定类型文件中的uuid成新的uuid

[https://github.com/wei-kris/cocos-creator-replace-uuid**github.com/wei-kris/cocos-creator-replace-uuid**](https://link.zhihu.com/?target=https%3A//github.com/wei-kris/cocos-creator-replace-uuid)

*Happy! Everybody*
