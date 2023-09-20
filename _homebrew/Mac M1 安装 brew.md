---
title: 'Mac M1 安装 brew'
layout: single
excerpt: ""
---

### 安装

[官网](https://brew.sh/)

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

[//]: # (国内镜像)
/bin/zsh -c "$(curl -fsSL https://gitee.com/huwei1024/HomebrewCN/raw/master/Homebrew.sh)"  #下载
/bin/zsh -c "$(curl -fsSL https://gitee.com/huwei1024/HomebrewCN/raw/master/HomebrewUninstall.sh)"  #卸载
```

执行完后，发现brew ，还是命令找不到。

![20230411_1.png](/assets/images/20230411_1.png)

### 配置

复制该内容到 vim ~/.zprofile：

```
echo '# Set PATH, MANPATH, etc., for Homebrew.' >> /Users/spuer/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/spuer/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

使生效：

```bash
source ~/.zprofile 
```

### 原因

从macOS Catalina(10.15.x) 版开始，Mac使用zsh作为默认Shell，对应文件是.zprofile。所以需要配置。

### 命令集合

- 安装命令：
  官网地址： The Missing Package Manager for macOS (or Linux) — Homebrew
  /bin/bash -c "$(curl -fsSL raw.githubusercontent.com/Homebrew/in…)"
- 卸载命令：
  /bin/bash -c "$(curl -fsSL raw.githubusercontent.com/Homebrew/in…)"
- 安装完后，还需要配置一下

### 出现的问题:

#### 1. Error: Another active Homebrew update process is already in progress

出现的原因： 可能因为之前安装过，有文件残留；

解决： 删除文件。rm -rf /usr/local/homebrew 值的注意的是： 查看自己的homebrew 的文件所在地，不一定是这个地址。

如果找不到的话，执行卸载命令，卸载如果能删除的干净的话，就删除了。如果删除不了，会提示你：

![20230411_2.png](/assets/images/20230411_2.png)
