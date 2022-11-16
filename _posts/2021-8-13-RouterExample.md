---
title: 'Android手撸一个简易路由Router'
excerpt: ""
classes: wide 
toc: true
categories: 
  - Android
tags:
  - Android 
  - Android Router
---

## 核心原理

目前市面上大部分的Router框架([ARouter](https://github.com/alibaba/ARouter),[WMRouter](https://github.com/meituan/WMRouter))实现核心原理都差不多，在代码里加入的@Route注解，会在编译时期通过apt生成一些存储path和activityClass映射关系的类文件，然后app进程启动的时候会拿到这些类文件，把保存这些映射关系的数据读到内存里(保存在map里)，然后在进行路由跳转的时候，通过build()方法传入要到达页面的路由地址。本文介绍如何实现一个简易路由Router来加深理解。

## 包结构

这里使用的是APT技术帮助我们在编译时自动生成我们需要用到相关的类，首先新建三个module ，arouter-api、lib-annotation和lib-annotation-compiler，需要注意的是lib-annotation和lib-annotation-compiler在New Module的时候要选的是Java or Kotlin Library 而不是其他。

![20210813_1](/assets/images/20210813_1.png)

## arouter-api

arouter-api模块很简单，只有ARouter和IRouter接口。

ARouter是一个单例，内部维护着一个Map用于管理跳转需要的path路径和目标Activity，这里只做简单的处理。IRouter则是提供对外实现的接口，下面会用到。

![20210813_2](/assets/images/20210813_2.png)

### ARouter.kt

```java
class ARouter {
    companion object {
        private const val TAG = "ARouter"
        private lateinit var activityMap: MutableMap<String, Class<out Activity?>>

        @JvmStatic
        val instance: ARouter by lazy(mode = LazyThreadSafetyMode.SYNCHRONIZED) {
            activityMap = mutableMapOf()
            ARouter()
        }
    }

    private lateinit var mContext: Context

    fun init(context: Context) {
        Log.d(TAG, "init: ")
        mContext = context
        val className: List<String> = getAllActivityUtils("com.he.arouter_api")
        for (cls in className) {
            Log.d(TAG, "init: className =$cls")
            try {
                val aClass = Class.forName(cls)
                if (IRouter::class.java.isAssignableFrom(aClass)) {
                    val iRouter = aClass.newInstance() as IRouter
                    iRouter.putActivity()
                }
            } catch (e: Exception) {
                Log.d(TAG, "init: Exception =" + e.message)
            }
        }
    }

    /**
     * 将activity压入 RouteProcessor调用
     *
     * @param activityName
     * @param cls
     */
    fun putActivity(activityName: String, cls: Class<out Activity?>?) {
        Log.d(TAG, "putActivity: $activityName")
        if (cls != null && !TextUtils.isEmpty(activityName)) {
            activityMap[activityName] = cls
        }
    }

    /**
     * 通过之前定义的path就行启动
     *
     * @param activityName
     */
    fun jumpActivity(activityName: String?) {
        jumpActivity(activityName, null)
    }

    fun jumpActivity(activityName: String?, bundle: Bundle?) {
        val intent = Intent()
        val aCls: Class<out Activity?>? = activityMap[activityName]
        Log.d(TAG, "jumpActivity: $aCls")
        if (aCls == null) {
            return
        }
        if (bundle != null) {
            intent.putExtras(bundle)
        }
        intent.setClass(mContext, aCls)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        Log.d(TAG, "jumpActivity: startActivity")
        mContext.startActivity(intent)
    }

    fun getAllActivityUtils(packageName: String?): List<String> {
        val list: MutableList<String> = arrayListOf()
        val path: String
        try {
            path = mContext.packageManager.getApplicationInfo(mContext.packageName, 0).sourceDir
            val dexFile = DexFile(path)
            val enumeration: Enumeration<*> = dexFile.entries()
            while (enumeration.hasMoreElements()) {
                val name = enumeration.nextElement() as String
                if (name.contains(packageName!!)) {
                    list.add(name)
                }
            }
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        }
        return list
    }
}
```

### IRouter.kt

```java
interface IRouter {
    fun putActivity()
}
```

## lib-annotation

annotation模块非常简单，这里只创建了一个Router注解，然后其他业务组件（如MainActivity、OneActivity、TwoActivity）依赖它.

```java
/**
 * Target  用于描述注解的使用范围
 * Retention  用于描述注解的保留时间
 * @AutoService(Processor.class)  AutoService使用kotiln注解有一些问题 ，会出现无法生成代码的情况,//https://cloud.tencent.com/developer/article/1587253
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.CLASS)
public @interface Route {

    String path() default "";
}

```

![20210813_3](/assets/images/20210813_3.png)

## lib-annotation-compiler

这个模块是核心，主要实现就在这里

### 当前模块下的build.gradle 需要添加几个依赖

```gradle
dependencies {
    implementation project(path: ':apt:lib-annotation')
    //https://github.com/google/auto
    annotationProcessor 'com.google.auto.service:auto-service:1.0'
    compileOnly 'com.google.auto.service:auto-service-annotations:1.0'
    //https://github.com/square/javapoet
    implementation 'com.squareup:javapoet:1.13.0'
}
```

### RouteProcessor

利用APT技术生成一个工具类，生成的类实现上面的IRouter，并覆写putActivity方法

```java
/**
 * @AutoService(Processor.class)  AutoService使用kotiln注解有一些问题 ，会出现无法生成代码的情况,//https://cloud.tencent.com/developer/article/1587253
 */
@AutoService(Processor.class)
public class RouteProcessor extends AbstractProcessor {

    Filer filer;

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        Set<? extends Element> elementsAnnotatedWith = roundEnv.getElementsAnnotatedWith(Route.class);
        Map<String, String> map = new HashMap<>();
        for (Element element :
                elementsAnnotatedWith) {
            TypeElement typeElement = (TypeElement) element;
            Route annotation = typeElement.getAnnotation(Route.class);
            String path = annotation.path();
            Name qualifiedName = typeElement.getQualifiedName();
            map.put(path, qualifiedName + ".class");
        }

        if (map.size() > 0) {
            Iterator<String> iterator = map.keySet().iterator();
            while (iterator.hasNext()) {
                String activityKey = iterator.next();
                String cls = map.get(activityKey);
                //使用Javapoet
                MethodSpec methodSpec = MethodSpec.methodBuilder("putActivity")
                        .addModifiers(Modifier.PUBLIC)
                        .returns(void.class)
                        .addStatement("ARouter.getInstance().putActivity("+"\""+activityKey+"\","+cls+")")
                        .build();
                final ClassName InterfaceName = ClassName.get("com.he.arouter_api","IRouter");
                TypeSpec typeSpec = TypeSpec.classBuilder("ActivityUtil"+System.currentTimeMillis())
                        .addSuperinterface(InterfaceName)
                        .addModifiers(Modifier.PUBLIC)
                        .addMethod(methodSpec)
                        .build();

                JavaFile javaFile = JavaFile.builder("com.he.arouter_api", typeSpec).build();
                try {
                    javaFile.writeTo(filer);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

//      //原生实现
//            Writer writer = null;
//            String className = "ActivityUtil" + System.currentTimeMillis();
//            try {
//                JavaFileObject classFile = filer.createSourceFile("com.he.arouter_api." + className);
//                writer = classFile.openWriter();
//                writer.write("package com.he.arouter_api;\n" +
//                        "\n" +
//                        "import com.he.arouter_api.ARouter;\n" +
//                        "import com.he.arouter_api.IRouter;\n" +
//                        "\n" +
//                        "public class " + className + " implements IRouter {\n" +
//                        "    @Override\n" +
//                        "    public void putActivity() {\n");
//
//                Iterator<String> iterator = map.keySet().iterator();
//                while (iterator.hasNext()) {
//                    String activityKey = iterator.next();
//                    String cls = map.get(activityKey);
//                    writer.write("        ARouter.getInstance().putActivity(");
//                    writer.write("\"" + activityKey + "\"," + cls + ");");
//                }
//                writer.write("\n}\n" +
//                        "}");
//            } catch (Exception e) {
//                e.printStackTrace();
//            } finally {
//                if (writer != null) {
//                    try {
//                        writer.close();
//                    } catch (IOException e) {
//                        e.printStackTrace();
//                    }
//                }
//            }

        }
        return false;
    }

    @Override
    public Set<String> getSupportedAnnotationTypes() {
        HashSet<String> types = new HashSet<>();
        types.add(Route.class.getCanonicalName());
        return types;
    }

    @Override
    public SourceVersion getSupportedSourceVersion() {
        return processingEnv.getSourceVersion();
    }

    @Override
    public synchronized void init(ProcessingEnvironment processingEnv) {
        super.init(processingEnv);
        filer = processingEnv.getFiler();
    }
}
```

> - getSupportedAnnotationTypes()方式表示我们要处理那个注解，这里是Route这个注解
> - getSupportedSourceVersion() 声明支持java 版本
> - init(ProcessingEnvironment processingEnv) 初始化，得到下面需要用到的Filer
> - process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) 主要代码生成逻辑在这里进行

## 最后使用

### 在需要使用Router的模块下的build.gradle添加依赖

```gradle
    implementation project(path: ':lib-annotation')
    kapt project(path: ':apt:lib-annotation-compiler') // 在kotiln项目中，为 Kotlin 提供 apt 服务,替换annotationProcessor
    implementation project(path: ':arouter-api')
```

### 在Application下初始化

```java
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        ARouter.instance.init(this)
    }
}
```

### 在目标Activity上加上@Route(path)

```java
@Route(path = "module_one/OneActivity")
class OneActivity : AppCompatActivity() {
    companion object{
        private const val TAG = "OneActivity"
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_one)
    }

}
```

### ARouter.instance.jumpActivity

```java
@Route(path = "main/MainActivity")
class MainActivity : AppCompatActivity() {
    companion object {
        private const val TAG = "MainActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        this.findViewById<Button>(R.id.btn).setOnClickListener {
            ARouter.instance.jumpActivity("module_one/OneActivity")
        }
    }
}
```

## 预览

![20210813_4](/assets/images/20210813_4.gif)
