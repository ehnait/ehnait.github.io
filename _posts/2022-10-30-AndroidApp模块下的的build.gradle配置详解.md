---
title: 'Android App模块下的的build.gradle配置详解'
excerpt : ""
classes: wide 
toc: true
categories: 
  - Gradle
tags:
  - Gradle

---

## [官方文档 :Android Plugin DSL Reference](https://google.github.io/android-gradle-dsl/2.3/index.html){: .btn .btn--primary}

## 1.defaultConfig (默认配置）

Android Gradle工程的配置，都是在android{}中，这是唯一的一个入口。通过它可以对Android Gradle工程进行自定义的配置。示例如下：

```gradle
android {
    namespace 'com.example.testapp'
    compileSdkVersion 33

    defaultConfig {
        applicationId "com.example.testapp"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"

//        consumerProguardFiles "consumer-rules.pro"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Specifies a flavor dimension.
    flavorDimensions "color"
    productFlavors {
        red {
            // Assigns this product flavor to the 'color' flavor dimension.
            // This step is optional if you are using only one dimension.
            dimension "color"
        }

        blue {
            dimension "color"
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = '1.8'
    }
    
    buildFeatures {
        viewBinding true
    }

    configurations.all {
        /*
        *<https://www.jianshu.com/p/289354394328/>
        *./gradlew build --refresh-dependencies
        */
        resolutionStrategy.cacheChangingModulesFor 24, 'hours'
        resolutionStrategy.cacheDynamicVersionsFor 10 * 60, 'seconds'
    }

    applicationVariants.all { variant ->
        variant.outputs.all { output ->
            def apkFileNameFormat = "app_${variant.flavorName}_${variant.buildType.name}_${variant.versionName}.apk"
            outputFileName = apkFileNameFormat
        }
    }
    
}
```

defaultConfig是Android对象中的一个配置块，负责定义所有的默认配置。其里面可以配置很多字段，一般基本的defaultConfig配置字段有：

- applicationId: 用于指写生成的APP的包名，默认情况下是null，若为null，则会在构建的时候从AndroidManifest.xml文件中配置的manifest标签的package属性读取。

- minSdkVerion: 用于指写APP最低支持的Android 系统版本，其对应的值是Android SKD 的API Level。

- targetSdkVersion: 是 Android 提供向前兼容的主要依据，表明是基于哪个Android 版本开发的。也就是说，只要targetSdkVersion 不变，即使APK 安装在新 Android 系统上，其行为还是保持老的系统上的行为，这样就保证了系统对老应用的前向兼容性。

- versionCode: 表明APP应用内部版本号，它是一个整数，一般用于APP升级

- verionName: 表明APP应用内部版本名称。更多介绍，请参考后面文章《Android Gradle使用详解(五) 之 动态生成App版本号》。

- consumerProguardFiles: 要包含在已发布 AAR 中的 ProGuard 规则文件。

- testInstrumentationRunner: 用于配置单元测试时使用的Runner，一般情况下使用默认的是android.test.InstrumentationTestRunner即可。

- testApplicationId: 用于配置测试APP的包名，默认情况下是applicationId + “.test”。一般情况下默认即可。

- testFunctionalTest: 用于配置单元测试时是否为功能测试。

- testHandleProfiling: 用于配置单元测试时是否启用分析功能。

## 2.buildTypes (构建类型）

buildTypes是一个域对象。它是对构建类型：release、debug等的配置。还可以在buildTypes{}里新增任意多个需要构建的类型。每一个BuildType还会生成一个SourceSet。上面示例中，release就是一个BuildType。一般地像defaultConfig{}中的配置如果需要区分不同的构建版本配置不同的参数的话，就得在这里进行配置。常用的配置如有:

- minifyEnabled（使用混淆）: 用于配置是否启用Proguard混淆，接收一个boolean类型的值。代码混淆是一个非常有用的功能，它不仅能使APK包size变小，还可以让反编译的人不容易看明白我们的源代码逻辑从而增加分析难度。一般情况下，release模式编译的版本一般会启动混淆功能。因为混淆后无法断点调试，所以debug模式下一般是不启动的。
- proguardFiles/ proguardFile:

    proguardFiles是当我们启用混淆时，ProGuard的配置文件，它可以同时接受多个配置文件，因为它的参数是一个可变类型的参数。

    proguardFile也是用于配置App proGuard混淆所使用的ProGuard配置文件，它接收一个文件作为参数。

    当我们将minifyEnabled设为true，启动混淆后，还要通过proguardFiles或proguardFile指写混淆的配置表:

    ```gradle
    ...

    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

    ```

- consumerProguardFiles: 跟proguardFiles的用法一样，在启动混淆时用于配置使用的ProGuard配置文件。只不过consumerProguardFiles是专门用于aar包使用，这样在应用引用aar包并启动混淆时，会自动使用这个属性配置对aar包里的代码进行混淆。

- applicationldSuffix: 用于配置基于默认applicationId的后缀，比如默认defaultConfig中配置的applicationId为com.example.testapp，若在debug的BuildType中指写applicationIdSuffix为.debug，那么构建生成的debug.apk的包名就是com.example.testapp.debug。

- debuggable: 用于配置是否生成一个可供调试的apk。一般release中都是为false，而debug中都是为true。

- jinDebuggable: 跟debuggable类似，用于配置是否生成一个可供调试Jni(C/C++)代码的apk。

- multiDexEnabled: 用于配置是否启用自动拆分多个Dex的功能。一般用程序中代码太多，超过了65535个方法的时候，拆分多个Dex，接收一个boolean类型的值

- zipAlignEnabled: 用于配置是否启用Android 的 zipalign整理优化APK文件的工具。zipalign能提高系统和应用运行效率，更快地读写APK中的资源，降低内存的使用。一般情况下，release模式编译的版本下都会启动此优化。

- shrinkResources（自动清理资源）: 用于配置在构建时是否自动清理未使用的资源，默认为false。此配置要配合minifyEnable(混淆)一起使用，因为先清理掉无用的代码后，这样一些无用的代码引用的资源才能被清理掉。
自动清理未使用的资源跟使用代码混淆都存在一个同样的问题，那就是当代中使用了反射去时，Android Gradle就区分不出来了，从而误清理了被引用的资源，针对这种情况，Android Gradle提供了keep方法来让我们配置哪些资源不被清理。操作如下：

    1. 新建一个xml文件:res/raw/keep.xml
    2. 通过tools:keep属性来配置，它接受一个以逗号分割的配置资源列表，并支持星号通配符
    3. 通过tools:shrinkMode属性配置自动清理资源的模式，默认是safe（安全的），也可以将它改为strict（严格的）
    4. 正常情况下，keep.xml会在构建时不会被打到包里去，不会影响apk的大小，除非你在代码中通过R.raw.keep来引用它

     ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <resources xmlns:tools="http://schemas.android.com/tools"
    tools:keep=" @layout/abc_*,@drawable/a_b_c_d" 
    tools:shrinkMode="strict"/>
     ```

- signingConfig: 用于配置APK包的签名信息，如：signingConfig signingConfigs.releaseConfig

## 3.signingConfigs（APK签名）

一个APP只有在签名这后才能被发布、安装和使用，签名是保护APP的方式，它能标记APP的唯一性，防止恶意篡改。它配置中使用的字段如下所示:

- storeFile: 指定签名证书文件，接收一个文件类型。

- storePassword: 配置签名证书文件的密码。

- keyAlias: 配置签名证书中密钥别名。

- keyPassword: 配置签名证书中该密钥的密码。

## 4.ProductFlavors（渠道配置）

多渠道、多语言的构建都是利用对ProductFlavor{}的配置。针对不同的渠道区分个别特殊功能、跟踪活跃留存这些数据来源是很有必要的，特别在国内应用市场如此多的情况下。每个ProductFlavor可以有自己的SourceSet，还可以有自己的Dependencies依赖，这意味着我们可以为每个渠道定义它们自己的资源、代码以及依赖的第三方库。几乎所有在defaultCofnig{}和buildTypes{}中可配置使用的方法或属性，都能在productFlavors{}中使用。下面就简单介绍下除了在defaultCofnig{}和buildTypes{}介绍过的属性方法外，还比较常用到到的一些属性和方法。

- BuildConfigField: 可用于在构建后在BuildConfig类中自定义新增一些常用的常量，例如渠道号。

- resValue:是一个方法，它在defaultCofnig{}、buildTypes{}和ProductFlavor中都可以使用。可用于自定义资源的方式来区分渠道。

- manifestPlaceholdes: 是一个Map类型，通过对它的配置就可以方便地动态来设置AndroidManifest中的预设的占位符变量。例如像友盟这类第三方分析统计，就会要求我们在AndroidManifest文件中指定渠道号名称。

- dimension: 是维度的意思，它就好像一个分组一样。用于多维度地对ProductFlavor{}配置，从而解决多渠道的脚本冗余和更好的维护。

- resConfigs: 属于PraductFlavor{}的一个方法，它可以让我们配置哪些类型的资源才被打到包中去。使用如：

    ```gradle
    ...
    resConfigs “en", “zh" // 或者 resConfigs “hdpi", “xhdpi", “xxhdpi"

    ```

## 5.compileOptions（编译选项）

我们有时候会对Java源文件的编码、源文件使用的JDK版本等进行调优修改。比如需要配置源文件的编码为UTF-8。还比如想配置编译Java源代码的级别为二级1.10，为此Android Gradle提供了compileOptions的配置入口让我们来做些配置，例如：
我们有时候会对Java源文件的编码、源文件使用的JDK版本等进行调优修改。比如需要配置源文件的编码为UTF-8。还比如想配置编译Java8 ，为此Android Gradle提供了compileOptions的配置入口让我们来做些配置，例如：

 ```gradle
android {
    ...
    compileOptions{
        ending = 'uft-8'
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    ……
}

```

- ending: 配置源文件的编码格式。

- sourceCompatibility: 配置Java源代码的编译级别。

- targetCompatibility: 配置生成的Java字节码的版本，其可以选值和sourceCompatibility一样。
