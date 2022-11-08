---
title: '使用rbenv无缝管理应用程序的Ruby环境'
excerpt_separator: "<!--more-->"
categories: 
  - Ruby
tags:
  - rbenv
  - Ruby
---

由于macOS本身的Ruby环境升级起来较为不方便，在搜寻解决方案之时发现rbenv
<!--more-->

## 简介

rbenv 是用于类 Unix 系统上的 Ruby 编程语言的版本管理器工具。它对于在同一台机器上的多个 Ruby 版本之间切换以及确保您正在处理的每个项目始终在正确的 Ruby 版本上运行非常有用。

- rbenv 文档 <https://github.com/rbenv/rbenv>
- rbenv 的简单性有其好处，但也有一些缺点。有关更多详细信息和一些替代方案，请参阅版本管理器的比较。  <https://github.com/rbenv/rbenv/wiki/Comparison-of-version-managers>

就我个人而言，我更喜欢rbenv，因为它与Homebrew一起工作得很好，并且不会太多地破坏shell环境。
