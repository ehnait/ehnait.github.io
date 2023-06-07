---
title: '这一次，让Kotlin Flow 操作符真正好用起来'
excerpt: ''
classes: wide
categories:
  - 移动端
tags:
  - Android
---

# 前言

协程系列文章：

> * [一个小故事讲明白进程、线程、Kotlin 协程到底啥关系？](https://juejin.cn/post/7108651566806073380 "https://juejin.cn/post/7108651566806073380")
> * [少年，你可知 Kotlin 协程最初的样子？](https://juejin.cn/post/7109410972653060109 "https://juejin.cn/post/7109410972653060109")
> * [讲真，Kotlin 协程的挂起/恢复没那么神秘(故事篇)](https://juejin.cn/post/7110143508513554440 "https://juejin.cn/post/7110143508513554440")
> * [讲真，Kotlin 协程的挂起/恢复没那么神秘(原理篇)](https://juejin.cn/post/7111246680338464804 "https://juejin.cn/post/7111246680338464804")
> * [Kotlin 协程调度切换线程是时候解开真相了](https://juejin.cn/post/7113706345190129700 "https://juejin.cn/post/7113706345190129700")
> * [Kotlin 协程之线程池探索之旅(与Java线程池PK)](https://juejin.cn/post/7114968347325759501 "https://juejin.cn/post/7114968347325759501")
> * [Kotlin 协程之取消与异常处理探索之旅(上)](https://juejin.cn/post/7127923407001223175 "https://juejin.cn/post/7127923407001223175")
> * [Kotlin 协程之取消与异常处理探索之旅(下)](https://juejin.cn/post/7128218056882389028 "https://juejin.cn/post/7128218056882389028")
> * [来，跟我一起撸Kotlin runBlocking/launch/join/async/delay 原理&使用](https://juejin.cn/post/7128961903220490270 "https://juejin.cn/post/7128961903220490270")
> * [继续来，同我一起撸Kotlin Channel 深水区](https://juejin.cn/post/7139468247119691807 "https://juejin.cn/post/7139468247119691807")
> * [Kotlin 协程 Select：看我如何多路复用](https://juejin.cn/post/7142083646822809607 "https://juejin.cn/post/7142083646822809607")
> * [Kotlin Sequence 是时候派上用场了](https://juejin.cn/post/7160910310100992014 "https://juejin.cn/post/7160910310100992014")
> * [Kotlin Flow啊，你将流向何方？](https://juejin.cn/post/7168511169781563428 "https://juejin.cn/post/7168511169781563428")
> * [Kotlin Flow 背压和线程切换竟然如此相似](https://juejin.cn/post/7172957388348063780 "https://juejin.cn/post/7172957388348063780")
> * [Kotlin SharedFlow&StateFlow 热流到底有多热？](https://juejin.cn/post/7195569817940164668 "https://juejin.cn/post/7195569817940164668")
> * [狂飙吧，Lifecycle与协程、Flow的化学反应](https://juejin.cn/post/7202987088153018425 "https://juejin.cn/post/7202987088153018425")
> * [来吧！接受Kotlin 协程--线程池的7个灵魂拷问](https://juejin.cn/post/7207078219215962170 "https://juejin.cn/post/7207078219215962170")
> * [当，Kotlin Flow与Channel相逢](https://juejin.cn/post/7224145268740325435 "https://juejin.cn/post/7224145268740325435")
> * [这一次，让Kotlin Flow 操作符真正好用起来](https://juejin.cn/post/7226933611265605669 "https://juejin.cn/post/7226933611265605669")

Kotlin Flow 如此受欢迎大部分归功于其丰富、简洁的操作符，巧妙使用Flow操作符可以大大简化我们的程序结构，提升可读性与可维护性。
然而，虽然好用，但有些操作符不太好理解，可惜的是网上大部分文章只是简单介绍其使用，并没有梳理各个操作符的关系以及引入的缘由，本篇将通过关键原理与使用场景串联大部分操作符，以期达到举一反三的效果。
通过本篇文章，你将了解到：

> 1. 操作符全家福
> 2. 单Flow操作符的原理以及使用场景
> 3. 单Flow操作符里的多协程原理以及使用场景
> 4. 多Flow操作符里的多协程原理以及使用场景
> 5. Flow操作符该怎么学？

# 1. 操作符全家福

![Flow操作符分类 (2).png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fcd426f41cb64929a8463508e3efc3b8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

*红色部分为使用了多协程的操作符*
*上图仅包含常用官方提供的操作符，其它未包含进来的操作符原理也是类似的，当然我们也可以封装自己的操作符*

由图上可知，将操作符分为了三类：

> 1. 构建操作符
> 2. 中间操作符
> 3. 末端操作符

# 2. 单Flow操作符的原理以及使用场景

## 最简单的Flow

```kotlin
    fun test0() {
        runBlocking {
            //构造flow
            val flow = flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
            }
            //收集flow
            flow.collect {
                //下游
                println("collect:$it ${Thread.currentThread()}")
            }
        }
    }
```

如上包含了两种操作符：构造操作符flow与末端操作符collect。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8af9da8e793b4627b07dab1987b2030f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

总结来说，flow调用流程简化为：两个操作符+两个闭包+emit函数：

> 1. collect操作符触发调用，执行了flow的闭包
> 2. flow闭包里调用emit函数，执行了collect闭包

## Flow返回集合

collect闭包里仅仅只是打印了数据，有个需求：需要将收集到的数据放在List里。
很容易就想到：

```kotlin
    fun test00() {
        runBlocking {
            val result = mutableListOf<String>()
            //构造flow
            val flow = flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
            }
            //收集flow
            flow.collect {
                //下游
                println("collect:$it ${Thread.currentThread()}")
                result.add(it)
            }
        }
    }
```

如上，定义List变量，在collect的闭包里收到数据后填充到List里。
某天，我们发现这个功能挺常用，需要将它封装起来，外界只需要传入List对象即可。

```kotlin
public suspend fun <T, C : MutableCollection<in T>> Flow<T>.toCollection(destination: C): C {
    collect { value ->
        destination.add(value)
    }
    return destination
}
```

外部使用：

```kotlin
    fun test01() {
        runBlocking {
            val result = mutableListOf<String>()
            flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
            }.toList(result)
        }
    }
```

如此一看，简单了许多，这也是官方提供的Flow操作符。

原理很简单：

> 1. 作为Flow的扩展函数
> 2. 重写了Flow的collect闭包，也就是FlowCollector的emit函数

后续很多操作符都是这么个套路，比如取Flow的第一个数据：first操作符，比如取对Flow里相邻的两个值做操作：reduce操作符等等。

## Flow变换操作符

有个需求：在Flow流到下游之前，对数据进行处理，处理完成后再发射出去。
可以使用transform 操作符。

```kotlin
    fun test02() {
        runBlocking {
            flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
            }.transform {
                emit("$it man")
            }.collect {
                println("$it")
            }
        }
    }
```

再看看原理：

```kotlin
public inline fun <T, R> Flow<T>.transform(
    @BuilderInference crossinline transform: suspend FlowCollector<R>.(value: T) -> Unit
): Flow<R> = flow { // Note: safe flow is used here, because collector is exposed to transform on each operation
    collect { value ->
        //上游的数据先经过transform处理
        return@collect transform(value)
    }
}
```

> 1. 依然是Flow扩展函数，返回一个新的Flow对象
> 2. 新Flow对象重写了flow闭包，该闭包里调用collect收集了原始Flow的数据
> 3. 当数据到来后，经过transform处理，而我们自定义的transform闭包里将数据再次发射出去
> 4. 最后新返回的flow的collect闭包被调用

上面只是使用了一个transform操作符，若是多个transform操作符，该怎么去分析呢？其实，套路是有迹可循的。
这里涉及到了一种设计模式：装饰者模式

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15e9c93e1c414e188f0dfd0df860e790~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

每调用1个transform操作符就会新生成一个Flow对象，该对象装饰了它的上一个(扩展)对象，如上Flow1装饰原始Flow，Flow2装饰Flow1。

```kotlin
    fun test02() {
        runBlocking {
            flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
            }.transform {
                emit("$it 1")
            }.transform {
                emit("$it 2")
            }.transform {
                emit("$it 3")
            }.collect {
                println("$it")
            }
        }
    }
```

如上，相信你很快就知道输出结果了。

你可能觉得transform还需要自己发射数据，有点麻烦，map可解君忧。

```kotlin
    fun test03() {
        runBlocking {
            flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
            }.map {
                "$it 1"
            }.collect {
                println("$it")
            }
        }
    }
```

map内部封装了transform。

## 过滤操作符

有个需求：对上流的数据进行某种条件的筛选过滤。
有了transform的经验，我们很容易想到定义扩展函数返回新的Flow，并重写collect的闭包，在闭包里进行限制。

```kotlin
public inline fun <T> Flow<T>.filter(crossinline predicate: suspend (T) -> Boolean): Flow<T> = transform { value ->
    //条件满足再发射
    if (predicate(value)) return@transform emit(value)
}

internal inline fun <T, R> Flow<T>.unsafeTransform(
    @BuilderInference crossinline transform: suspend FlowCollector<R>.(value: T) -> Unit
): Flow<R> = unsafeFlow { // Note: unsafe flow is used here, because unsafeTransform is only for internal use
    collect { value ->
        return@collect transform(value)
    }
}
```

使用方式：

```kotlin
    fun test04() {
        runBlocking {
            flow {
                //上游
                emit("hello world ${Thread.currentThread()}")
                emit("fish")
            }.filter {
                //包含hello字符串才继续往下发送
                it.contains("hello")
            }.collect {
                println("$it")
            }
        }
    }
```

掌握了以上套路，再去理解其它类似的操作符就很简单了，都是一些简单的变种。

# 3. 单Flow操作符里的多协程原理以及使用场景

## Flow里如何切换协程与线程

上面提到的操作符，如map、filter，相信大家也看出来了：

> 整个流程的过程没有涉及到其它协程，也没有涉及到其它的线程，是比较单纯也比较容易理解

有个需求：在主线程执行collect操作符，在flow闭包里执行耗时操作。
此时我们就需要flow闭包里的代码在子线程执行。
你可能一下子就说出了答案：使用flowOn操作符。

```kotlin
    fun test05() {
        runBlocking {
            flow {
                //上游
                println("emit ${Thread.currentThread()}")
                emit("hello world")
            }.flowOn(Dispatchers.IO)//flowOn 之前的操作符在新协程里执行
                .collect {
                    println("$it")
                    println("collect ${Thread.currentThread()}")
                }
        }
    }
//打印结果
emit Thread[DefaultDispatcher-worker-1 @coroutine#3,5,main]
hello world
collect Thread[main @coroutine#2,5,main]
```

可以看出，flow闭包(上游)，collect闭包(下游)分别执行在不同的协程以及不同的线程里。
flowOn原理简单来说：

> 构造了新的协程执行flow闭包，又因为指定了协程分发器为Dispatchers.IO，因此会在子线程里执行flow闭包
> 原理是基于ChannelFlow

## Flow处理背压

有个需求：上游发射数据速度高于下游，如何提升发射效率？
如下：

```kotlin
    fun test06() {
        runBlocking {
            val time = measureTimeMillis {
                flow {
                    //上游
                    println("emit ${Thread.currentThread()}")
                    emit("hello world")
                    delay(1000)
                    emit("hello world2")
                }.collect {
                        delay(2000)
                        println("$it")
                        println("collect ${Thread.currentThread()}")
                    }
            }
            println("use time:$time")
        }
    }
//打印
emit Thread[main @coroutine#2,5,main]
hello world
collect Thread[main @coroutine#2,5,main]
hello world2
collect Thread[main @coroutine#2,5,main]
use time:5024
```

使用buffer操作符解决背压问题：

```kotlin
    fun test06() {
        runBlocking {
            val time = measureTimeMillis {
                flow {
                    //上游
                    println("emit ${Thread.currentThread()}")
                    emit("hello world")
                    delay(1000)
                    emit("hello world2")
                }.buffer().collect {
                        delay(2000)
                        println("$it")
                        println("collect ${Thread.currentThread()}")
                    }
            }
            println("use time:$time")
        }
    }
//打印结果
emit Thread[main @coroutine#3,5,main]
hello world
collect Thread[main @coroutine#2,5,main]
hello world2
collect Thread[main @coroutine#2,5,main]
use time:4065
```

可以看出，总耗时减少了。
buffer原理简单来说：

> 构造了新的协程执行flow闭包，上游数据会发送到Channel 缓冲区里，发送完成继续发送下一条
> collect操作符监听缓冲区是否有数据，若有则收集成功
> 原理是基于ChannelFlow

关于flowOn和buffer更详细的原理请移步：[Kotlin Flow 背压和线程切换竟然如此相似](https://juejin.cn/post/7172957388348063780 "https://juejin.cn/post/7172957388348063780")

## 上游覆盖旧数据

有个需求：上游生产速度很快，下游消费速度慢，我们只关心最新数据，旧的数据没价值可以丢掉。 使用conflate操作符处理：

```kotlin
    fun test07() {
        runBlocking {
            flow {
                //上游
                repeat(5) {
                    emit("emit $it")
                    delay(100)
                }
            }.conflate().collect {
                delay(500)
                println("$it")
            }
        }
    }
//打印结果：
emit 0
emit 4
```

可以看出，中间产生的数据由于下游没有来得及消费，被上游新的数据冲刷掉了。

conflate原理简单来说：

> 相当于使用了buffer操作符，该buffer只能容纳一个数据，新来的数据将会覆盖旧的数据
> 原理是基于ChannelFlow

## Flow变换取最新值

有个需求：在使用transform处理数据的时候，若是它处理比较慢，当有新的值过来后就取消未处理好的值。
使用transformLatest操作符处理：

```kotlin
    fun test08() {
        runBlocking {
            flow {
                //上游，协程1
                repeat(5) {
                    emit("emit $it")
                }
                println("emit ${Thread.currentThread()}")
            }.transformLatest {
                //协程2
                delay(200)
                emit("$it fish")
            }.collect {
                println("collect ${Thread.currentThread()}")
                println("$it")
            }
        }
    }
打印结果：
emit Thread[main @coroutine#3,5,main]
collect Thread[main @coroutine#2,5,main]
emit 4 fish
```

可以看出，由于transform处理速度比较慢，上游有新的数据过来后会取消transform里未处理的数据。 查看源码是如何处理的：

```kotlin
override suspend fun flowCollect(collector: FlowCollector<R>) {
    coroutineScope {
        var previousFlow: Job? = null
        //开始收集上游数据
        flow.collect { value ->
            previousFlow?.apply {
                //若是之前的协程还在，则取消
                cancel(ChildCancelledException())
                join()
            }
            //开启协程执行，此处选择不分发新线程
            previousFlow = launch(start = CoroutineStart.UNDISPATCHED) {
                collector.transform(value)
            }
        }
    }
}
```

transformLatest原理简单来说：

> 构造新的协程1执行flow闭包，收集到数据后再开启新的协程2，在协程里会调用transformLatest的闭包，最终调用collect的闭包
> 协程1继续发送数据，若是发现协程2还在运行，则取消协程2
> 原理是基于ChannelFlow

同理，map也有类似的操作符：

```kotlin
    fun test09() {
        runBlocking {
            flow {
                //上游
                repeat(5) {
                    emit("emit $it")
                }
                println("emit ${Thread.currentThread()}")
            }.mapLatest {
                delay(200)
                "$it fish"
            }.collect {
                println("collect ${Thread.currentThread()}")
                println("$it")
            }
        }
    }
//打印结果
emit Thread[main @coroutine#3,5,main]
collect Thread[main @coroutine#2,5,main]
emit 4 fish
```

## 收集最新的数据

有个需求：监听下载进度，UI展示最新进度。
分析：此种场景下，我们只是关注最新的进度，没必要频繁刷新UI，因此使用Flow实现时上游发射太快了可以忽略旧的数据。
使用collectLatest操作符实现：

```kotlin
    fun test014() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
                    repeat(100) {
                        emit(it + 1)
                    }
                }
                flow1.collectLatest {
                    delay(20)
                    println("collect progress $it")
                }
            }
            println("use time:$time")
        }
    }
//打印结果
collect progress 100
use time:169
```

collectLatest原理简单来说：

> 开启新协程执行flow闭包
> 若是collect收集比较慢，下一个数据emit过来后会取消未处理的数据
> 原理是基于ChannelFlow

# 4. 多Flow操作符里的多协程原理以及使用场景

很多时候我们不止操作单个Flow，有可能需要结合多个Flow来实现特定的业务场景。

## 展平流

### flatMapConcat

有个需求：请求某个学生的班主任信息，这里涉及到两个接口：

> 1. 请求学生信息，使用Flow1表示
> 2. 请求该学生的班主任信息，使用Flow2表示
> 3. 我们需要先拿到学生的信息，通过信息里带的班主任id去请求班主任信息

分析需求可知：获取学生信息的请求和获取班主任信息的请求是串行的，有前后依赖关系。
使用flatMapConcat操作符实现：

```kotlin
    fun test010() {
        runBlocking {
            val flow1 = flow {
                emit("stuInfo")
            }
            flow1.flatMapConcat {
                //flow2
                flow {
                    emit("$it teachInfo")
                }
            }.collect {
                println("collect $it")
            }
        }
    }
//打印结果：
collect stuInfo teachInfo
```

从打印结果可以看出：

> 所谓展平，实际上就是将两个Flow的数据拍平了输出

当然，你也可以请求多个学生的班主任信息：

```kotlin
    fun test011() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
                    println("emit ${Thread.currentThread()}")
                    emit("stuInfo 1")
                    emit("stuInfo 2")
                    emit("stuInfo 3")
                }
                flow1.flatMapConcat {
                    //flow2
                    flow {
                        println("flatMapConcat ${Thread.currentThread()}")
                        emit("$it teachInfo")
                        delay(1000)
                    }
                }.collect {
                    println("collect ${Thread.currentThread()}")
                    println("collect $it")
                }
            }
            println("use time:$time")
        }
    }
//打印结果：
emit Thread[main @coroutine#2,5,main]
flatMapConcat Thread[main @coroutine#2,5,main]
collect Thread[main @coroutine#2,5,main]
collect stuInfo 1 teachInfo
flatMapConcat Thread[main @coroutine#2,5,main]
collect Thread[main @coroutine#2,5,main]
collect stuInfo 2 teachInfo
flatMapConcat Thread[main @coroutine#2,5,main]
collect Thread[main @coroutine#2,5,main]
collect stuInfo 3 teachInfo
use time:3032
```

flatMapConcat原理简单来说：

> flatMapConcat 并没有涉及到多协程，使用了装饰者模式
> 先将Flow2使用map进行变换，而后将Flow1、Flow2数据发射出来
> Concat顾名思义，将两个Flow连接起来

### flatMapMerge

有个需求：在flatMapConcat里，先查询了学生1的班主任信息后才会查询学生2的班主任信息，依照此顺序进行查询。现在需要提升效率，同时查询多个多个学生的班主任信息。
使用flatMapMerge操作符实现：

```kotlin
    fun test012() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
                    println("emit ${Thread.currentThread()}")
                    emit("stuInfo 1")
                    emit("stuInfo 2")
                    emit("stuInfo 3")
                }
                flow1.flatMapMerge(4) {
                    //flow2
                    flow {
                        println("flatMapMerge ${Thread.currentThread()}")
                        emit("$it teachInfo")
                        delay(1000)
                    }
                }.collect {
                    println("collect ${Thread.currentThread()}")
                    println("collect $it")
                }
            }
            println("use time:$time")
        }
    }
//打印结果：
flatMapMerge Thread[main @coroutine#6,5,main]
collect Thread[main @coroutine#2,5,main]
collect stuInfo 1 teachInfo
collect Thread[main @coroutine#2,5,main]
collect stuInfo 2 teachInfo
collect Thread[main @coroutine#2,5,main]
collect stuInfo 3 teachInfo
use time:1086
```

可以看出，flatMapMerge由于是并发执行，整体速度比flatMapConcat快了很多。
flatMapMerge可以指定并发的数量，当指定flatMapMerge(0)时，flatMapMerge退化为flatMapConcat。
关键源码如下：

```kotlin
override suspend fun collectTo(scope: ProducerScope<T>) {
    val semaphore = Semaphore(concurrency)
    val collector = SendingCollector(scope)
    val job: Job? = coroutineContext[Job]
    flow.collect { inner ->
        job?.ensureActive()
        //并发数限制锁
        semaphore.acquire()
        scope.launch {
            //开启新的协程
            try {
                //执行flatMapMerge闭包里的flow
                inner.collect(collector)
            } finally {
                semaphore.release() // Release concurrency permit
            }
        }
    }
}
```

flatMapMerge原理简单来说：

> flow1里的每个学生信息会触发去获取班主任信息flow2
> 新开了协程去执行flow2的闭包
> 原理是基于ChannelFlow

### flatMapLatest

有个需求：flatMapConcat
是线性执行的，可以使用flatMapMerge提升效率。为了节约资源，在请求班主任信息的时候，若是某个学生的班主任信息没有返回，而下一个学生的班主任信息已经开始请求，则取消上一个没有返回的班主任Flow。
使用flatMapLatest操作符实现：

```kotlin
    fun test013() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
//                    println("emit ${Thread.currentThread()}")
                    emit("stuInfo 1")
                    emit("stuInfo 2")
                    emit("stuInfo 3")
                }
                flow1.flatMapLatest {
                    //flow2
                    flow {
//                        println("flatMapLatest ${Thread.currentThread()}")
                        delay(1000)
                        emit("$it teachInfo")
                    }
                }.collect {
//                    println("collect ${Thread.currentThread()}")
                    println("collect $it")
                }
            }
            println("use time:$time")
        }
    }
//打印结果：
collect stuInfo 3 teachInfo
use time:1105
```

可以看出，只有学生3的班主任信息打印出来了，并且整体时间都减少了。
flatMapLatest原理简单来说：

> 和transformLatest很相似
> 原理是基于ChannelFlow

简单总结一下关于收集最新数据的操作符：

> transformLatest、mapLatest、collectLatest、flatMapLatest 四者的核心实现都是ChannelFlowTransformLatest，而它最终继承自：ChannelFlow

## 组合流

### combine

有个需求：查询学生的性别以及选修了某个课程。
分析：涉及到两个需求，查询学生性别与查询选修课程，输出结果是：性别：xx，选修了：xx课程。这俩请求可以同时发出，并没有先后顺序，因此我们没必要使用flatMapXX系列操作符。
使用combine操作符：

```kotlin
    fun test015() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
                    emit("stuSex 1")
                    emit("stuSex 2")
                    emit("stuSex 3")
                }
                val flow2 = flow {
                    emit("stuSubject")
                }
                flow1.combine(flow2) {
                    sex, subject->"$sex-->$subject"
                }.collect {
                    println(it)
                }
            }
            println("use time:$time")
        }
    }
//打印结果：
stuSex 1-->stuSubject
stuSex 2-->stuSubject
stuSex 3-->stuSubject
use time:46
```

可以看出，flow1的每个emit和flow2的emit关联起来了。
combine操作符有个特点：

> 短的一方会等待长的一方结束后才结束

看个例子就比较清晰：

```kotlin
    fun test016() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
                    emit("a")
                    emit("b")
                    emit("c")
                    emit("d")
                }
                val flow2 = flow {
                    emit("1")
                    emit("2")
                }
                flow1.combine(flow2) {
                        sex, subject->"$sex-->$subject"
                }.collect {
                    println(it)
                }
            }
            println("use time:$time")
        }
    }
//打印结果
a-->1
b-->2
c-->2
d-->2
use time:45
```

flow2早就发射到"2"了，会一直等到flow1发射结束。

combine原理简单来说：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b59a56dbda744c88a4159eecadd0ff05~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

### zip

在combine需求的基础上，我们又有个优化：无论是学生性别还是学生课程，只要某个Flow获取结束了就取消Flow。
使用zip操作符：

```kotlin
    fun test017() {
        runBlocking {
            val time = measureTimeMillis {
                val flow1 = flow {
                    emit("a")
                    emit("b")
                    emit("c")
                    emit("d")
                }
                val flow2 = flow {
                    emit("1")
                    emit("2")
                }
                flow1.zip(flow2) {
                        sex, subject->"$sex-->$subject"
                }.collect {
                    println(it)
                }
            }
            println("use time:$time")
        }
    }
//打印结果
a-->1
b-->2
use time:71
```

可以看出flow2先结束了，并且flow1没发送完成。
zip原理简单来说：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/758036faf15d4cea9980344a3047c048~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

可以看出，zip的特点：

> 短的Flow结束，另一个Flow也结束

# 5. Flow操作符该怎么学？

以上我们由浅入深分别分析了：

> 1. 单个Flow操作符原理与使用场景
> 2. 单个Flow操作符切换多个协程的原理与使用场景
> 3. 多个Flow操作符切换多个协程的原理与使用场景

以上三者是递进关系，第1点比较简单，第2点难度适中。
尤其是第3点比较难以理解，因为涉及到了其它的知识：Channel、ChannelFlow、多协程、线程切换等。
在之前的文章中有提到过：ChannelFlow是Flow复杂操作符的基础，想要掌握复杂操作符的原理需要明白ChannelFlow的运行机制，有兴趣可移步：[当，Kotlin Flow与Channel相逢](https://juejin.cn/post/7224145268740325435 "https://juejin.cn/post/7224145268740325435")

建议Flow操作符学习步骤：

> 1. 先会使用简单的操作符filter、map等
> 2. 再学会使用flowOn、buffer、callbackFlow等操作符
> 3. 进而使用flatMapXXX以及combine、zip等操作符
> 4. 最后可以看看其实现原理，达到举一反三应用到实际需求里

Flow操作符的闭坑指南：

> 1. 涉及到多协程的操作符，需要关注其执行的线程环境
> 2. 涉及到多协程的操作符，需要关注协程的生命周期

说实话，Flow操作符要掌握好挺难的，它几乎涉及了协程所有的知识点，也是协程实际应用的精华。这篇是我在协程系列里花费时间最长的文章了（也许也是最后一篇了），即使自己弄明白了，怎样把它很自然地递进引出也是个有挑战的事。
若你能够在本篇的分析中得到一点启发，那说明我的分享是有价值的。
由于篇幅关系，一些操作符debounce、sample等并没有分析，也没有再贴flatMapXXX的源码细节（这部分之前的文章都有分析过），若你有需要可以给我留言评论。

本文基于Kotlin
1.6.1，[覆盖所有Flow操作符的demo](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Ffishforest%2FKotlinDemo%2Fblob%2Fmaster%2Fapp%2Fsrc%2Fmain%2Fjava%2Fcom%2Ffish%2Fkotlindemo%2Fflowoperand%2FFlowOperandAll.kt "https://github.com/fishforest/KotlinDemo/blob/master/app/src/main/java/com/fish/kotlindemo/flowoperand/FlowOperandAll.kt")

# 您若喜欢，请点赞、关注、收藏，您的鼓励是我前进的动力

# 持续更新中，和我一起步步为营系统、深入学习Android/Kotlin

1. [Android各种Context的前世今生](https://juejin.cn/post/7015968660179124238 "https://juejin.cn/post/7015968660179124238")
2. [Android DecorView 必知必会](https://juejin.cn/post/7015973616659464206 "https://juejin.cn/post/7015973616659464206")
3. [Window/WindowManager 不可不知之事](https://juejin.cn/post/7015978746104512548 "https://juejin.cn/post/7015978746104512548")
4. [View Measure/Layout/Draw 真明白了](https://juejin.cn/post/7016245187055878180 "https://juejin.cn/post/7016245187055878180")
5. [Android事件分发全套服务](https://juejin.cn/post/7016233922828697608 "https://juejin.cn/post/7016233922828697608")
6. [Android invalidate/postInvalidate/requestLayout 彻底厘清](https://juejin.cn/post/7017452765672636446 "https://juejin.cn/post/7017452765672636446")
7. [Android Window 如何确定大小/onMeasure()多次执行原因](https://juejin.cn/post/7015980840047869983 "https://juejin.cn/post/7015980840047869983")
8. [Android事件驱动Handler-Message-Looper解析](https://juejin.cn/post/7015237933120618504 "https://juejin.cn/post/7015237933120618504")
9. [Android 键盘一招搞定](https://juejin.cn/post/7012844100994990087 "https://juejin.cn/post/7012844100994990087")
10. [Android 各种坐标彻底明了](https://juejin.cn/post/7017834467175874591 "https://juejin.cn/post/7017834467175874591")
11. [Android Activity/Window/View 的background](https://juejin.cn/post/7018044178709872677 "https://juejin.cn/post/7018044178709872677")
12. [Android Activity创建到View的显示过](https://juejin.cn/post/7015959719739129869 "https://juejin.cn/post/7015959719739129869")
13. [Android IPC 系列](https://juejin.cn/post/7023238726503383076 "https://juejin.cn/post/7023238726503383076")
14. [Android 存储系列](https://juejin.cn/post/7012108220982362149 "https://juejin.cn/post/7012108220982362149")
15. [Java 并发系列不再疑惑](https://juejin.cn/post/7010305230256488485 "https://juejin.cn/post/7010305230256488485")
16. [Java 线程池系列](https://juejin.cn/post/7010622964781547527 "https://juejin.cn/post/7010622964781547527")
17. [Android Jetpack 前置基础系列](https://juejin.cn/post/7035235129479921671 "https://juejin.cn/post/7035235129479921671")
18. [Android Jetpack 易学易懂系列](https://juejin.cn/post/7071837699832807438 "https://juejin.cn/post/7071837699832807438")
19. [Kotlin 轻松入门系列](https://juejin.cn/post/7097248290671951909 "https://juejin.cn/post/7097248290671951909")
20. [Kotlin 协程系列全面解读](https://juejin.cn/post/7108651566806073380 "https://juejin.cn/post/7108651566806073380")
