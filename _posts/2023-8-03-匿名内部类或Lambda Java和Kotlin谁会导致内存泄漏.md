---
title: '匿名内部类/Lambda Java和Kotlin谁会导致内存泄漏?'
excerpt: ""
classes: wide
categories:
  - 移动端
tags:
  - Android
---

# 前言

内存泄漏是程序界永恒的话题，对于Android开发来说尤为重要，想让你的App表现得更优雅，了解并治理内存泄漏问题势在必行。
通过本篇文章，你将了解到：

> 1. 何为内存泄漏?
> 2. Android 常见内存泄漏场景
> 3. Java匿名内部类会导致泄漏吗？
> 4. Java的Lambda是否会泄漏？
> 5. Kotlin匿名内部类会导致泄漏吗？
> 6. Kotlin的Lambda是否会泄漏？
> 7. Kotlin高阶函数的会泄漏吗？
> 8. 内存泄漏总结

# 1. 何为内存泄漏?

## 简单内存分布

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40ee38611c6040848c4336f6797c1083~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

如上图，系统在分配内存的时候，会寻找空闲的内存块进行分配（有些需要连续的存储空间）。
分配成功，则标记该内存块被占用，当内存块不再被使用时，则置为空闲。

占用和被占用涉及到内存的分配和释放，在不同的程序语言里有不同的封装。

C 分配/释放内存函数：

> 分配：malloc函数
> 释放：free函数

C++ 分配/释放内存函数：

> 分配：new函数
> 释放：delete函数

C/C++ 需要程序员手动分配和释放内存，而我们知道手动的东西容易遗漏。

> 如果一块内存永远不再被使用，但是又没有被回收，那么这段内存一直无法被复用，这就是内存泄漏

## Java内存泄漏

鉴于C/C++ 需要手动释放内存容易遗漏最后造成内存泄漏的问题，Java在内存回收机制上做了改进：
**不需要程序员手动释放内存，JVM系统有GC机制，定期扫描不再被引用的对象，将对象所占的的内存空间释放。**

你可能会有疑惑：既然都有GC机制了，为啥还会有泄漏呢？
因为GC是根据可达性来判别对象是否还在使用，当GC动作发生时，如果一个对象被gc root对象持有，那么它是无法被回收的。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e70000f848f9430a8aa4382b8f942bcd~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

如上图，obj1~obj5被gc root 直接或间接持有，它们是不会被回收的，而obj6~obj10 没有被gc root持有，它们是可以被回收的。

## 常见的作为gc root的对象

JVM在发起GC 动作的时候，需要从gc root出发判别对象的可达性，常见的gc root对象：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad1673c11c274b1e909b5bf2ba2cb4db~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

开发里排查内存泄漏涉及比较多的gc root是：

> JNI 变量、静态引用、活动的线程

如果不涉及到JNI开发，我们更多关注的是后两者。

到此，我们知道了Java内存泄漏的缘由：

> 不再被使用的对象，因为一些不当的操作导致其被gc root持有无法被回收，最终内存泄漏

# 2. Android 常见内存泄漏场景

## 经典泄漏问题

### Handler使用不当泄漏

先看耳熟能详的Demo：

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);
    }

    private Handler handler = new Handler() {
        @Override
        public void handleMessage(@NonNull Message msg) {
            super.handleMessage(msg);
            Log.d("fish", "hello world");
        }
    };
}
```

上面有个匿名内部类，继承自Handler。
我们知道在Java里，匿名内部类默认持有外部类引用，并且此处编译器会有提示：

```kotlin
This Handler class should be static or leaks might occur (anonymous android.os.Handler)
```

意思是：

> 推荐使用静态类来继承Handler，因为使用匿名内部类可能会有内存泄漏风险

**我们做个实验，操作步骤：打开Activity，关闭Activity，观察内存使用状况，是否发生内存泄漏。**

问题来了：以上代码会有内存泄漏吗？
答案当然是否定的，因为我们并没有使用handler对象。

将代码改造一下，onCreate里新增如下代码：

```kotlin
        handler.sendEmptyMessageDelayed(2, 5000);
```

此时会发生内存泄漏吗？
当然肉眼是无法证明是否泄漏的，我们通过使用Android Studio自带的性能分析工具：Profiler 进行分析：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e0b5ff774554a2382437a68c754aa4a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

果然Activity发生泄漏了。

如何规避此种场景下的内存泄漏呢？

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);

        new MyHandler().sendEmptyMessageDelayed(2, 5000);
    }

    static class MyHandler extends Handler {
        @Override
        public void handleMessage(@NonNull Message msg) {
            super.handleMessage(msg);
            Log.d("fish", "hello world");
        }
    }
}
```

使用静态内部类实现Handler功能，静态内部类默认没有持有外部类引用。
检测结果，没有发生内存泄漏。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93cca95d0cbd4a829d1d31e16986a488~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

无论是匿名内部类还是静态内部类，都没有显式地持有外部类引用，既然匿名内部类会发生泄漏，那为啥还需要匿名内部类呢？
匿名内部类优点：

> 1. 无需重新定义新的具名类
> 2. 符合条件的匿名内部类可以转为Lambda表达式，简洁
> 3. 匿名内部类可以直接访问外部类引用

假若现在需要在收到message时弹出个Toast。
对于匿名内部类的实现很简单：

```kotlin
    private Handler handler = new Handler() {
        @Override
        public void handleMessage(@NonNull Message msg) {
            super.handleMessage(msg);
            Toast.makeText(ThirdActivity.this, "hello world", Toast.LENGTH_SHORT).show();
        }
    };
```

因为它默认持有外部类引用。

而对于静态内部类，则提示无法访问外部类对象。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6394a6a17ca94bcb9224291cf83fd2d6~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

需要给它单独传递外部类引用，相较于匿名内部类比较繁琐。

#### Handler 泄漏的本质原因

对于当前的Demo来说，匿名内部类隐式持有外部类引用，我们需要需要找到匿名内部类被哪个gc root直接/间接地持有了。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/afa5b96be8dd499f9236d31b123c7559~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

由图可知，最终Activity被Thread持有了。
简单回顾源码流程：

> 1. 构造Handler对象时会绑定当前线程的Looper，Looper里持有MessageQueue引用
> 2. 当前线程的Looper存储在Thread里的ThreadLocal
> 3. 当Handler发送消息的时候，构造Message对象，而该Message对象持有Handler引用
> 4. Message对象将会被放置在MessageQueue里
> 5. 由此推断，Thread将会间接持有Handler，而Handler又持有外部类引用，最终Thread将会间接持有外部类引用，导致了泄漏

### 线程使用不当泄漏

先看简单Demo：

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(200000);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        });
    }
}
```

问：上述代码会发生内存泄漏吗？
答：当然不会，因为线程并没有开启。

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(200000);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }).start();
    }
}
```

再分析分析，会有内存泄漏吗？
与之前的Handler一致，匿名内部类会持有外部类的引用，而匿名内部类本身又被线程持有，因此会发生泄漏。

如何规避此种场景下的内存泄漏呢？

有两种方式：
**第一种：使用静态内部类替换匿名内部类**
此种方式同Handler处理类似。

**第二种：使用Lambda替换匿名内部类**

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);

        new Thread(() -> {
            try {
                Thread.sleep(200000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }).start();
    }
}
```

Lambda表达式没有隐式持有外部类，因此此种场景下不会有内存泄漏风险。

### 注册不当内存泄漏

模拟一个简单下载过程，首先定义一个下载管理类：

```kotlin
public class DownloadManager {
   private DownloadManager() {
   }
   static class Inner {
      private static final DownloadManager ins = new DownloadManager();
   }
   public static DownloadManager getIns() {
      return Inner.ins;
   }
   private HashMap<String, DownloadListener> map = new HashMap();
   //模拟注册
   public void download(DownloadListener listener, String path) {
      map.put(path, listener);
      new Thread(() -> {
         //模拟下载
         listener.onSuc();
      }).start();
   }
}

interface DownloadListener {
   void onSuc();
   void onFail();
}
```

外部传入下载路径，下载成功后通知外界调用者：

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);

        DownloadManager.getIns().download(new DownloadListener() {
            @Override
            public void onSuc() {
                //更新UI
            }
            @Override
            public void onFail() {
            }
        }, "hello test");
    }
}
```

因为需要在下载回调时更新UI，因此选择匿名内部类接收回调，而因为该匿名内部类被静态变量： DownloadManager.ins 持有。
也就是说：

> 静态变量作为gc root，间接持有匿名内部类，最终持有Activity导致了泄漏

如何规避此种场景下的内存泄漏呢？

有两种方式：

> 1. 静态内部类持有Activity弱引用
> 2. DownloadManager提供反注册方式，当Activity销毁时反注册从Map里移除回调

# 3. Java匿名内部类会导致泄漏吗？

## 线程持有匿名内部类对象

内存泄漏的一些前置知识已经过了一遍，接下来我们从字节码的角度分别分析匿名内部类、Lambda表达式、高阶函数是否存在泄漏问题。
先看Demo：

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);
        new Thread(new Runnable() {
            @Override
            public void run() {
                Log.d("fish", "hello world");
            }
        }).start();
    }
}
```

当我们进入Activity，而后又退出时，猜猜会发生泄漏吗？
有些小伙伴会说：当然了，线程持有匿名内部类对象，而匿名内部类对象又持有外部类(Activity)引用。
实际上是此处的线程并没有执行耗时任务，很快就结束了，系统回收Activity对象时线程已经结束了，不会再持有匿名内部类对象了。

怎么确定匿名内部类持有外部类引用呢？
一个很直观的表现：

> 在匿名内部类里访问外部类实例变量，若是编译器没有提示错误，则可以认为匿名内部类持有外部类引用

当然，想要看到石锤就得从字节码出发了。

## Java匿名内部类Class文件

build一下并查找Javac的产物：在/build/intermediates/javac 开头的目录下

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9ca4e2ebb2d463e88d5e3bc030a1b44~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

这里是看不到匿名内部类的，需要到文件浏览器里查找。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d527e8025e0e4f169555ccb25797d6cf~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看出，我们只是声明了一个ThirdActivity类，但是生成了两个Class文件，其中一个是匿名内部类生成的，通常命名方式为：外部类名+"\$"+"第几个内部类"+".class"。
拖到Studio里查看内容：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1361041bd5b4506a9c46490b22af5e1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

显然匿名内部类构造函数形参里有外部类的类型，当构造匿名内部类时会传递进去并赋值给匿名内部类的成员变量。

## Java匿名内部类字节码

查看字节码方式有多种，可以用javap命令：

```kotlin
javap -c ThirdActivity$1.class
```

也可以在Android Studio里下载字节码插件：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/475b1954db9f46a889ed19e876c3cdfd~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

在源文件上右键选择查看字节码：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f7c939edbf146ba8d05613f3c59a5ff~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看出：

> 1. New 指令创建匿名内部类对象并复制到操作数栈顶
> 2. 加载外部类对象到操作数栈顶
> 3. 调用匿名内部类构造函数，并将第2步的栈顶对象传入

如此一来，匿名内部类创建了，并且持有了外部类引用。

回到最初问题，Java匿名内部类是否会泄漏呢？

> 当外部类销毁的时候，如果匿名内部类被gc root 持有(间接/直接)，那么将会发生内存泄漏

# 4. Java的Lambda是否会泄漏？

## 线程持有Lambda对象

将上小结的匿名内部类改造为Lambda（注：不是所有的匿名内部类都可以转为Lambda表达式）

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);
        new Thread(() -> {
            Log.d("fish", "hello world");
            Log.d("fish", "hello world2");
        }).start();
    }
}
```

## Java Lambda生成的Class文件

Java Lambda并没有生成Class文件。

## Java Lambda字节码

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05a9e47717ed4aefa32350b2da1b33e5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62c5b66b9f2c4b02999df894c664e049~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

Java Lambda并没有生成Class文件，而是通过INVOKEDYNAMIC 指令动态生成Runnable对象，最后传入Thread里。
可以看出，此时生成的Lambda并没有持有外部类引用。

## Java Lambda显式持有外部类引用

```kotlin
public class ThirdActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_third);
        new Thread(() -> {
            //显式持有外部类引用
            Log.d("fish", ThirdActivity.class.getName());
        }).start();
    }
}
```

再查看字节码：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3aea1ea8110b4e4196b81e99b7c49ff8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看出，传入了外部类引用。
回到最初问题，Java Lambda是否会泄漏呢？

> 1. Lambda没有隐式持有外部类引用，
> 2. 若在Lambda内显式持有外部类引用，那么此时和Java 匿名内部类类似的，当外部类销毁的时候，如果Lambda被gc root 持有(间接/直接)，那么将会发生内存泄漏

# 5. Kotlin匿名内部类会导致泄漏吗？

## 线程持有匿名内部类对象

```kotlin
class FourActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFourBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFourBinding.inflate(layoutInflater)
        setContentView(binding.root)
        Thread(object : Runnable {
            override fun run() {
                println("hello world")
            }
        }).start()
    }
}
```

此时匿名内部类会持有外部类引用吗？
先从生成的Class文件入手。

## Kotlin 匿名内部类生成的Class文件

Kotlin编译生成的Class目录：build/tmp/kotlin-classes/ 查找生成的Class文件：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a1c5edf193a4594bd31f9a3dbdb2ce8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

我们发现生成了Class文件，命名规则：外部类名+方法名+第几个匿名内部类+".class"

## Kotlin 匿名内部类字节码

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2abf792f57ba4c788ff929fedad5c2d0~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看出，并没有持有外部类引用。

## Kotlin 匿名内部类显式持有外部类引用

```kotlin
class FourActivity : AppCompatActivity() {
    val name = "fish"
    private lateinit var binding: ActivityFourBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFourBinding.inflate(layoutInflater)
        setContentView(binding.root)
        Thread(object : Runnable {
            override fun run() {
                println("hello world $name")
            }
        }).start()
    }
}
```

查看字节码：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32a06abb404143e49324b1cd6ecd7246~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

由此可见，构造函数携带了外部类引用。

回到最初问题，Kotlin 匿名内部类是否会泄漏呢？

> 1. Kotlin 匿名内部类没有隐式持有外部类引用，
> 2. 若在Kotlin 匿名内部类内显式持有外部类引用，那么此时和Java 匿名内部类类似的，当外部类销毁的时候，如果Lambda被gc root 持有(间接/直接)，那么将会发生内存泄漏

# 6. Kotlin的Lambda是否会泄漏？

## 线程持有Lambda对象

```kotlin
class FourActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFourBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFourBinding.inflate(layoutInflater)
        setContentView(binding.root)
        Thread { println("hello world ") }
    }
}
```

此时Lambda会持有外部类引用吗？
先从生成的Class文件入手。

## Kotlin Lambda生成的Class文件

Kotlin Lambda 并没有生成Class文件。

## Kotlin Lambda字节码

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/753e17ff08e540e9b3b68ccddf88002b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5554be90bae843a3ab1913c228990a94~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看出，并没有隐式持有外部类引用。

## Kotlin Lambda显式持有外部类引用

```kotlin
class FourActivity : AppCompatActivity() {
    val name = "fish"
    private lateinit var binding: ActivityFourBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFourBinding.inflate(layoutInflater)
        setContentView(binding.root)
        Thread { println("hello world $name") }
    }
}
```

查看字节码：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a42b78ce30b4ae79256fa94ff08c6ba~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

由此可见，构造函数携带了外部类引用。

回到最初问题，Kotlin Lambda是否会泄漏呢？

> 和Java Lambda表述一致

# 7. Kotlin高阶函数的会泄漏吗？

## 什么是高阶函数？

将函数类型当做形参或返回值的函数称为高阶函数。
高阶函数在Kotlin里无处不在，是Kotlin简洁写法的一大利器。

## 高阶函数生成的Class文件

```kotlin
class FourActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFourBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFourBinding.inflate(layoutInflater)
        setContentView(binding.root)
        test {
            println("$it")
        }
    }
    //高阶函数作为形参
    private fun test(block:(String) -> Unit) {
        block.invoke("fish")
    }
}
```

很简单的一个高阶函数，查看生成的Class文件：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53b6fcc233494c2ebbb2a85f2307d249~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

查看Kotlin Bytecode内容：

```kotlin
final class com/fish/perform/FourActivity$onCreate$1 extends kotlin/jvm/internal/Lambda implements kotlin/jvm/functions/Function1 {
```

继承自Lambda，并实现了Function1接口。
它的构造函数并没有形参，说明不会传入外部类引用。

## 高阶函数的字节码

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1371e96211d44f186aca5fdd82497f8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

和之前分析的匿名内部类和Lambda不同的是(虽然高阶函数也可以用Lambda简化表达)：涉及到了GETSTATIC指令。
该指令意思是从静态变量里获取高阶函数的引用，在高阶函数的字节码加载的时候就已经将静态变量初始化：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbd07c6872dc4d5db18acddb7f29b996~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以这么理解：

> 1. 高阶函数的Class加载的时候会初始化实例，并将该实例存储在静态变量里
> 2. 当外部调用高阶函数时，从静态变量里获取高阶函数实例

## 高阶函数显式持有外部类引用

```kotlin
class FourActivity : AppCompatActivity() {
    val name="fish"
    private lateinit var binding: ActivityFourBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFourBinding.inflate(layoutInflater)
        setContentView(binding.root)
        test {
            println("$it:$name")
        }
    }
    //高阶函数作为形参
    private fun test(block:(String) -> Unit) {
        block.invoke("fish")
    }
}
```

查看字节码：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7204809903a84dfda7a3db1ea31feca9~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

构造函数持有了外部类引用，此时并没有生成静态变量（没必要生成，若生成了就是妥妥的内存泄漏了)

回到最初问题，高阶函数是否会泄漏呢？

> 1. 高阶函数没有隐式持有外部类引用
> 2. 若在高阶函数内显式持有外部类引用，那么此时和Java 匿名内部类类似的，当外部类销毁的时候，如果高阶函数被gc root 持有(间接/直接)，那么将会发生内存泄漏

# [](https://)8. 内存泄漏总结

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7822dddc28694462b7c10e9f4a8d87d1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

简单理解内存泄漏：

> 1. 长生命周期的对象持有短生命周期的对象，导致短生命周期的对象在生命周期结束后没有被及时回收，导致内存无法复用，最终泄漏
> 2. 合理地释放对短生命周期对象的引用
>
