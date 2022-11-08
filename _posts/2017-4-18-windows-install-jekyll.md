---
title: 'windows环境下搭建Jekyll'
excerpt : ""
categories: 
  - Jekyll
tags:
  - Jekyll
toc: true
---
## Jekyll 是什么？

jekyll是一个简单的免费的Blog生成工具，类似WordPress。但是和WordPress又有很大的不同，原因是jekyll只是一个生成静态网页的工具，不需要数据库支持。但是可以配合第三方服务,例如Disqus。最关键的是jekyll可以免费部署在Github上，而且可以绑定自己的域名。

## Jekyll 学习链接

[Jekyll官网](http://jekyllrb.com/)
[Jekyll中文文档](http://jekyll.com.cn/docs/home/)  
[Jekyll 模板下载](http://jekyllthemes.org/)

## 如何搭建

### 1 安装Ruby

下载ruby: <http://rubyinstaller.org/downloads/>  
![install_ruby](/assets/images/20180207_1.png)  

我下载的是ruby2.3.3 (x64)、Devkit (x64) 如果你是32位系统就下载32位的。 &nbsp;&nbsp;
安装ruby后记得配置环境变量，也可以在安装过程中**勾选**自动添加变量。

### 2 验证

在ruby目录运行命令 ruby -v  &nbsp;&nbsp; 显示版本号则表示安装成功

### 3 修改Devkit配置

在Devkit的解压目录中 &nbsp;&nbsp;shift+鼠标右键&nbsp;在此处打开命令窗口，输入命令
ruby dk.rb init &nbsp;后文件夹内会多出来一个config.ym ,打开添加Ruby的路径，如图:  

![devkit_config](/assets/images/20180207_2.png)  

### 4 安装DevKit和cucumber插件 &nbsp; (cucumber：管它有没有用先安上再说)

```ruby

 1 gem update --system
 2 gem install rspec
 3 gem install httparty
 4 gem install wdm  

 //注意：ruby和devkit后面的版本号要对应  不然会出问题（当时搞了好久 ，具体什么问题忘记了）

```

### 5修改镜像源

ruby.taobao.org 目前已经停止维护了。可以使用RubyGems 镜像 - Ruby China。原因参考这篇文章Ruby China 的 RubyGems 镜像上线。

---

在切换到新的<http://gems.ruby-china.org的源时，还是有可能会出现这个提示Errorfetching>，这个情况有两个可能：  
(1)是因为系统是Windows的缘故，你可以把<https://gems.ruby-china.org/中的https换成http，我就是这样成功更换源的。这个问题在ruby>的社区里有人已经提到了。

(2)如果是其他系统，则可能是SSL证书没更新，更新SSL证书后解决。另外有一点要注意的是Windows上相关的ruby操作命令请尽量在Windows CMD环境下执行。

> 参考链接：<https://www.zhihu.com/question/35099113/answer/96638683>

## 更新ruby 和gems

在ruby目录下：

```ruby
 1. gem update --system
 2. gem install rspec
 3. gem install httparty
 4. gem install wdm
 
```

## 安装Jekyll

运行命令：gem install jekyll  
至此 jekyll 就安装好了
