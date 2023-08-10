﻿---
title: '电话攻击，电话炸弹，电话轰炸(可代替短信轰炸) 联系莆田医院，专门炸坏蛋，BOOM💥'
excerpt: ""
classes: wide
categories:
  - 框架与库
tags:
  - Python
---

[GitHub直达](https://github.com/ehnait/contactPutianHospital)

# contactPutianHospital

## 说明

此项目借鉴[callPhoneBoom](https://github.com/olyble/callPhoneBoom)
，使用[DrissionPage](http://g1879.gitee.io/drissionpagedocs/)简化了操作流程并对边界情况进行了处理。

## 初衷

在生活中总会遇见很多坏蛋，他们心理BT，他们不惧怕法律 ，他们游走在法律的边缘，他们势力庞大。 像我一样的守法好公民对这些坏蛋毫无办法。
最终我只好选择**以德报怨**。我推测这些坏蛋们一定是是因为一些隐疾而导致心理BT的，所以我主动帮他们联系**莆田系医院**
，帮他们咨询。此举深藏功与名。
每联系一个医院都会**功德+1**

## 思路

通过在百度上爬取「莆田系医院」这一营销组件的企业的网址, 然后通过成模拟浏览将目标手机号发送给企业，让这些企业给目标联系人打电话。

## Feature

1. 通过程序模拟浏览莆田系医院网址，自动发送目标手机号给企业 **main.py**。
2. 可设置定时任务 **scheduler.py**
3. 内置爬取莆田系医院网址的脚本  **catch.py**

## 使用教程

1. 克隆或下载你的代码到本地。
2. 创建一个新的虚拟环境（可选）。
3. 在终端或命令提示符下进入项目目录，并激活虚拟环境（如果有）。
4. 运行以下命令来安装依赖项：
   ```
   pip install -r requirements.txt
   ```
5. 修改并运行一下 **config.py** 确保配置正确
6. 运行 **main.py**

## 免责声明

1. 若使用者滥用本项目,本人 **无需承担** 任何法律责任.
2. 本程序仅供娱乐,源码全部开源,**禁止滥用** 和二次 **贩卖盈利**.  **禁止用于商业用途**.

## 运行截图

![20230808_1](/assets/images/20230808_1.png)
