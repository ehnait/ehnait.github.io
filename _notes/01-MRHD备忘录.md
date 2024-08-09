---
title: '备忘录'
header:
  teaser: /assets/images/teaser-image-2.jpg
toc: true
---

一些项目脚本

### 检查资源依赖冲突

```shell
  python3 checkValidRes.py --dir assets/文件夹名称
```

### 转换多语言json文件

```shell
   python3 convxlsx.py
```

### 创建Protocol Buffers(简称Protobuf)文件

```shell
   sh createpb.sh
```

### 切换渠道

查看: assets/buildconfig/buildconfig.json

```shell
   sh changepcchannel.sh std_vnTest
```

### 打包命令

```shell
   git reset --hard && git clean -d -f 
   sh createhotupdate_standalone.sh std_vnTest
```

### 复制smallgameutil

```shell
   python3 copysmallgameutil.py --game xxx
```

###         

```shell
   git reset --hard && git clean -d -f 
   sh createhotupdate_standalone.sh std_vnTest
#   sh createhotupdate_standalone.sh std_vnlocal
```

### 复制新项目

修改以下文件：

- createpb.py
- buildscene.txt

步骤：

1. 导出 zoo
2. 新建一个项目
3. 导入 zoo.zip
4. 在新工程把zoo 文件夹改名为 fifa,
5. 把fifa导出成zip, 再导入到原工程

重命名文件避免冲突：

```shell
  sh rename.sh
```

