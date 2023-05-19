---
title: 'Android使用Fastlane自动化打包发布到fir.im'
excerpt: "Android/IOS开发人员可以通过Fastlane结合Fir.im(或者蒲公英)等托管平台快速完成应用的分发，还能结合fir_cli等插件一键配置钉钉、飞书的Webhook通知到群组里。"
toc: true
categories:
  - 移动端
tags:
  - Android
  - Fastlane
---

## 前言

Android/IOS开发人员可以通过Fastlane结合Fir.im(或者蒲公英)等托管平台快速完成应用的分发，还能结合fir_cli等插件一键配置钉钉、飞书的Webhook通知到群组里。

- fir.im是免费应用内测托管平台
- fastlane是一款供 iOS 和 Android 开发人员自动执行繁琐任务的工具，例如生成屏幕截图、处理配置文件和发布应用程序。

## 导航

本教程基于Fastlane官方教程，可依据以下地址自行进行查阅（官网Docs啥都有）:

- [fastlane](https://github.com/fastlane/fastlane){: .btn .btn--success}
- [fastlane docs](https://docs.fastlane.tools/){: .btn .btn--success}
- [fir_cli plugin](https://github.com/PGYER/fastlane-plugin-fir_cli){: .btn .btn--success}
- [fir.im](https://betaqr.com/){: .btn .btn--success}

## 配置

### 环境

- Ruby环境+Bundler(MacOS / Linux / Windows)

- MacOS用户 建议直接使用brew安装:

    ```shell
    brew install fastlane
    ```

### 初始化 fastlane

- 在**项目根目录**下执行命令:

  ```shell
    fastlane init
  ```

  系统会要求您确认您已准备好开始，然后再提供一些信息。快速入门：

- 在询问时提供您的应用程序的软件包名称（例如io.fabric.yourapp）※ 这个步骤不小心按快了也没关系,可以在Appfile中重新定义,或者说这个对于国内不上谷歌商店的来说应该不重要(我是这么理解的)

- 当询问您的json机密文件的路径时，按Enter键

- 当系统询问您是否打算通过快速通道将信息上传到Google Play时，请回答“ n”（我们可以稍后进行设置）
就是这样！fastlane将根据提供的信息自动为您生成配置。

通过以上步骤后，您可以看到新创建的./fastlane目录，其中包含以下文件：

- Appfile 它定义了应用程序全局的配置信息
- Fastfile它定义了驱动器的行为的“通道” FASTLANE

![20221102_1](/assets/images/20221102_1.png){: .align-center}

不需要在意actions文件夹,除非咱们想自定义action
{: .notice--info}

### 安装fir_cli插件

使用 [fir-cli](https://github.com/PGYER/fastlane-plugin-fir_cli) 这个gem, 在fastlane 中直接将文件上传到 fir.im

在上一步初始化配置fastlane的项目位置中运行

```shell
  fastlane add_plugin fir_cli
```

里面已经内置 fir-cli 这个gem, 直接在fastlane 中直接将文件上传到 fir.im
会在Pluginfile文件中多出

![20221102_2](/assets/images/20221102_2.png){: .align-center}

### 获取fir.im的API token

需要在fir网站中进行登录拿到自己的APIToken
![20221102_3](/assets/images/20221102_3.png){: .align-center}

### 编写Fastfile文件

#### 1单渠道配置

```ruby
default_platform(:android)
platform :android do
    lane :gofir do
        # 单渠道配置
        gradle(task: 'assemble', build_type: 'Release')
        changelog_from_git_commits(commits_count: 1, merge_commit_filtering: "exclude_merges")
        fir_cli(
            api_token: "xxx", # fir.im种的api token
            specify_file_path: lane_context[SharedValues::GRADLE_APK_OUTPUT_PATH], # gradle apk 系统默认配置的的输出路径
            changelog: lane_context[SharedValues::FL_CHANGELOG], # fir.im 的change log 系统默认配置的输出路径
            dingtalk_access_token: "xxxx", # 钉钉机器人的webhook token
            dingtalk_custom_message: lane_context[SharedValues::FL_CHANGELOG],  # 钉钉渠道的change log
            dingtalk_at_all:true  # 钉钉是否@所有人
          )
    #     sh("ls") #fastlane支持shell
    end
end
```

#### 2多渠道配置

```ruby
# This file contains the fastlane.tools configuration
# You can find the documentation at https://docs.fastlane.tools
#
# For a list of all available actions, check out
#
#     https://docs.fastlane.tools/actions
#
# For a list of all available plugins, check out
#
#     https://docs.fastlane.tools/plugins/available-plugins
#

# Uncomment the line if you want fastlane to automatically update itself
# update_fastlane


default_platform(:android)

platform :android do

    lane :gofir do
        flavors =[
                 "flavor1",
                 "flavor2"
                 ]
        flavors.each do |flavor|
            go(param: flavor)
        end
    end

    lane :go do |option|
            flavor = option[:param]
            gradle(
                  #https://docs.fastlane.tools/actions/gradle/
                  task: "assemble",
                  flavor: flavor,
                  build_type: "Release"
            )

            changelog_from_git_commits(commits_count: 1, merge_commit_filtering: "exclude_merges")  # https://docs.fastlane.tools/actions/changelog_from_git_commits/
            fir_cli(
                api_token: "xxx",
                specify_file_path: lane_context[SharedValues::GRADLE_APK_OUTPUT_PATH],
                changelog: lane_context[SharedValues::FL_CHANGELOG],
                dingtalk_access_token: "xxx",
                dingtalk_custom_message: "当前flavor:[#{lane_context[SharedValues::GRADLE_FLAVOR]}] ,最近一次提交信息 [#{lane_context[SharedValues::FL_CHANGELOG]}]",
                dingtalk_at_all:true
            )
    end
end

```

lane: xxx do 运行体 结束要跟随 end
{: .notice--warning}

### 运行

在项目根目录下:

```shell
fastlane gofir
```

如果提示gradlew 权限被拒绝 ，可以尝试在终端输入 **chmod +x gradlew**
{: .notice--info}

## 总结

这样发布到fir就完成了,fastlane同时还支持调用脚本 可以调用 sh 这样咱们不写action也可以通过sh实现一些自己想要的功能,例如发布完成后发送邮件给测试人员,告知领导任务完成了~
