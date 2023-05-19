---
title: 'Android数据加密'
excerpt: "android 数据加密思路"
categories:
  - 移动端
tags:
  - Android
---
### android 数据加密思路

1. 混淆文件（参考：<http://www.jianshu.com/p/f3455ecaa56e>）
2. 加固：360加固宝，爱加密等自行选择
3. HTTPS：现在很多APP都用HTTPS作为网络传输的保证，防止中间人攻击，提高数据传输的安全性（用Retrofit的网络请求框架的，要加上HTTPS也不是什么难事，推荐 <http://www.jianshu.com/p/16994e49e2f6> ，这里说的HTTPS是指自签的）
4. 如果你没用HTTPS的话，为了确保传输安全，还需对传输的数据进行加密，这里我推荐用AES+RSA进行加密.  
**具体过程：**
是先由服务器创建RSA密钥对，RSA公钥保存在安卓的so文件里面，服务器保存RSA私钥。而安卓创建AES密钥（这个密钥也是在so文件里面），并用该AES密钥加密待传送的明文数据，同时用接受的RSA公钥加密AES密钥，最后把用RSA公钥加密后的AES密钥同密文一起通过Internet传输发送到服务器。当服务器收到这个被加密的AES密钥和密文后，首先调用服务器保存的RSA私钥，并用该私钥解密加密的AES密钥，得到AES密钥。最后用该AES密钥解密密文得到明文。（用Retrofit的网络请求框架的，要加密参数和解密服务器传输过来的数据需自定义Converter，推荐<http://blog.csdn.net/zr940326/article/details/51549310>）
5. so文件：ndk开发的so，可以存放一些重要的数据，如：密钥、私钥、API_KEy等，不过这里我建议大家使用分段存放，C层（so文件）+String文件（string.xml）+gradle文件，用的时候再拼接合并，还有如上图所示，AES的加密算法是放在C层进行实现的，这样也是最大程度保护我们数据的安全
6. 公钥传输是否有安全问题？（RSAkey）  
固定key，也就是保存在so文件中，理论上不会不安全，当然也可以动态从服务器获取，但传输不安全（前提不是https）
7. AES key存储在哪里比较好？  
分段存放，C层（so文件）+String文件（string.xml）+gradle文件；也可以从服务获取

> 原链接：<https://www.jianshu.com/p/d4fee3a2de82>

---

### 01.目录

> 古典加密算法：凯撒加密

> ascii编码

> Byte和bit：二进制字节和位关系

> base64编码和解密

> 对称加密算法：DES、AES

> 非对称加密RSA

> 消息摘要：md5、sha1、sha256

> 数字签名：避免黑客抓包篡改参数

> 只有是一家公司，有能力，必须使用加密算法

> 目标：独立封装对称加密算法、非对称加密算法、使用md5加密用户登录/注册信息

### 02.ascii编码

> ASCII编码：美国信息标准交互码，就是用来显示西欧字符

&nbsp;&nbsp;&nbsp;&nbsp;**ASCII编码对照表入口-->(<http://tool.oschina.net/commons?type=4>)**

> 获取字符ascii编码  

```java
 //获取单个字符ascii
 char ch = 'A';
 int ascii = ch;
  
 //System.out.println(ascii);
  
 //获取字符串ascii
 String str = "Hello";
 char[] charArray = str.toCharArray();
 for (char c : charArray) {
 int value = c;
 System.out.println(value);
 }
```

### 03.凯撒加密解密

> 古罗马大帝凯撒发明:对字符串偏移

![kaisa](https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1108566231,1444400255&fm=27&gp=0.jpg)

```java
  public static String encrypt(String input, int key) {
  StringBuilder stringBuilder = new StringBuilder();
  //获取每一个字符ascii编码
  char[] arr = input.toCharArray();
  for (char c : arr) {
   int ascii = c;
   //偏移一位
   ascii = ascii + key;
   //获取ascii对应的字符
   char result = (char) ascii;
   //System.out.print(result);
   stringBuilder.append(result);
  }
  return stringBuilder.toString();
 }
 

 public static String decrypt(String input, int key) {
  StringBuilder stringBuilder = new StringBuilder();
  //获取每一个字符ascii编码
  char[] arr = input.toCharArray();
  for (char c : arr) {
   int ascii = c;
   //偏移一位
   ascii = ascii - key;
   //获取ascii对应的字符
   char result = (char) ascii;
   //System.out.print(result);
   stringBuilder.append(result);
  }
  return stringBuilder.toString();
 }

```

### 04.频度分析法破解凯撒加密算法

> 根据统计学破解凯撒算法：一篇英文文章字母e出现的概率很高

### 05.Byte和bit

> Byte:字节，一个Byte有8位，1Byte=8bit

> bit:位

> 示例代码

```java
 String input = "A";//一个英文字母占1个字节（Byte）
  String input2 = "我爱你";//一个中文utf-8编码表中占3个字节，一个中文gbk编码表中占2个字节
   
  byte[] bytes = input.getBytes();//获取字符对应的Byte数组
  System.out.println(bytes.length);
   
  byte[] bytes2 = input2.getBytes();
  byte[] bytes3 = input2.getBytes("GBK");
  System.out.println(bytes2.length);
  System.out.println("gbk编码："+bytes3.length);
   
  char[] charArray = input.toCharArray();
  for (char c : charArray) {
   int ascii = c;
   System.out.println(ascii);
   //转成二进制
   String binaryString = Integer.toBinaryString(ascii);
   System.out.println(binaryString);
   }


```

### 06.常见对称加密算法介绍

> DES:企业级开发使用频率很高，Data Encryption Standard数据加密标准

> AES：Advanced Encryption Standard，高级数据加密标准，比DES破解难度大

> 底层机制：操作的不是字符，操作的是二进制（字符二进制显示成矩阵，矩阵变化）

### 07.DES加密

> DES：Data Encryption Standard数据加密标准

> 掌握参考api文档实现加密算法

> 对称加密三部曲：

* 1.创建cipher对象，cipher加密算法核心类
* 2.初始化加密/解密模式
* 3.加密/解密

> 加密算法、安全领域大量使用getInstance(参数) 方法

```java
 public static void main(String[] args) {
  String input = "我爱你";
  String password = "12345678";//秘钥:des秘钥长度是64个bit（位）
  try {
   //  1.创建cipher对象，cipher加密算法核心类
   Cipher cipher = Cipher.getInstance("DES");
   Key key = new SecretKeySpec(password.getBytes(), "DES");
   //  2.初始化加密/解密模式:以后只要是对象参数是int，说明有常量
   cipher.init(Cipher.ENCRYPT_MODE, key);//加密模式
   //  3.加密
   byte[] encrypt = cipher.doFinal(input.getBytes());
   
   System.out.println("DES加密="+new String(encrypt));
  } catch (Exception e) {
   e.printStackTrace();
  }
 }

```

### 08.DES解密

```java
 public static byte[] encrypt(String input, String password) {
  try {
   //  1.创建cipher对象，cipher加密算法核心类
   Cipher cipher = Cipher.getInstance("DES");
   Key key = new SecretKeySpec(password.getBytes(), "DES");
   //  2.初始化加密/解密模式:以后只要是对象参数是int，说明有常量
   cipher.init(Cipher.ENCRYPT_MODE, key);//加密模式
   //  3.加密
   byte[] encrypt = cipher.doFinal(input.getBytes());
   
   return encrypt;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }


 /**
  * DES解密
  */
 public static byte[] decrypt(byte[] input, String password) {
  try {
   //  1.创建cipher对象，cipher加密算法核心类
   Cipher cipher = Cipher.getInstance("DES");
   Key key = new SecretKeySpec(password.getBytes(), "DES");
   //  2.初始化加密/解密模式:以后只要是对象参数是int，说明有常量
   cipher.init(Cipher.DECRYPT_MODE, key);//解密模式
   //  3.加密
   byte[] decrypt = cipher.doFinal(input);
   
   return decrypt;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
```

### 09.Base64编码和解码

> DES加密后密文长度是8个整数倍

> 加密后比明文长度变长，所以编码表找不到对应字符，乱码

> 使用Base64编码和解密：从Apache现在

> 1.加密后密文使用Base64编码

> 2.解密前对密文解码

```java
 public static String encrypt(String input, String password) {
  try {
   //  1.创建cipher对象，cipher加密算法核心类
   Cipher cipher = Cipher.getInstance("DES");
   Key key = new SecretKeySpec(password.getBytes(), "DES");
   //  2.初始化加密/解密模式:以后只要是对象参数是int，说明有常量
   cipher.init(Cipher.ENCRYPT_MODE, key);//加密模式
   //  3.加密
   byte[] encrypt = cipher.doFinal(input.getBytes());
   
   return Base64.encode(encrypt);
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
 
 /**
  * DES解密
  */
 public static String decrypt(String input, String password) {
  try {
   //  1.创建cipher对象，cipher加密算法核心类
   Cipher cipher = Cipher.getInstance("DES");
   Key key = new SecretKeySpec(password.getBytes(), "DES");
   //  2.初始化加密/解密模式:以后只要是对象参数是int，说明有常量
   cipher.init(Cipher.DECRYPT_MODE, key);//解密模式
   //  3.加密
   byte[] decrypt = cipher.doFinal(Base64.decode(input));
   
   return new String(decrypt);
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }

```

### 10.AES加密解密

```java
 public static String encrypt(String input, String password) {
  try {
   //对称加密三部曲
   //1.创建cipher对象
   Cipher cipher = Cipher.getInstance(TRANSFORMATION);
   //SecretKeySpec：秘钥规范 -> 将字符串秘钥转成对象
   Key key = new SecretKeySpec(password.getBytes(), TRANSFORMATION);
   //2.初始化加密/解密模式
   cipher.init(Cipher.ENCRYPT_MODE, key);
   //3.加密
   byte[] encrypt = cipher.doFinal(input.getBytes());
   String encode = Base64.encode(encrypt);
   
   return encode;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
 
 /**
  * AES解密
  */
 public static String decrypt(String input, String password) {
  try {
   //对称加密三部曲
   //1.创建cipher对象
   Cipher cipher = Cipher.getInstance(TRANSFORMATION);
   //SecretKeySpec：秘钥规范 -> 将字符串秘钥转成对象
   Key key = new SecretKeySpec(password.getBytes(), TRANSFORMATION);
   //2.初始化加密/解密模式
   cipher.init(Cipher.DECRYPT_MODE, key);
   //3.加密
   byte[] encrypt = cipher.doFinal(Base64.decode(input));//解密前对密文解码
   //String encode = Base64.encode(encrypt);
   
   return new String(encrypt);
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }

```

### 11.对称加密密钥长度分析

> DES秘钥长度：8个字符

> AES秘钥长度：16个字符

> DES加密后密文长度是8的整数倍

> AES加密后密文长度是16的整数倍

### 12.工作模式和填充模式

> IOS加密，android没有解密:工作模式和填充模式不一致

> 工作模式：如何加密（ECB：并行加密，分段加密，每一段不相互影响；CBC只能串行加密）

> 填充模式:加密后密文长度如果达不到指定整数倍（8个字节、16个字节），填充对应字符

### 13.工作模式填充模式的使用

> 默认工作模式/填充模式：ECB/PKCS5Padding

> CBC工作模式：报错Parameters missing，CBC模式需求额外参数

> NoPadding不填充模式：DES原文长度必须是8个字节整数倍，AES原文长度必须是16个字节整数倍

### 14.对称加密应用实战

> 算法：DES、AES，企业级开发使用DES足够安全，如果要求高使用AES

> 特点：可逆（加密后可以解密）

> 需求：从服务器获取数据，缓存到本地，加密

### 15.非对称加密算法RSA介绍

> RSA:到2008年为止，世界上还没有任何可靠的攻击RSA算法的方式

> 秘钥对：公钥和私钥，秘钥对不能手动指定，必须有系统生成

> 加密速度慢：必须分段加密，不能加密大文件

> 公钥加密私钥解密；私钥加密公钥解密

> 公钥互换：连个商家合作需要交互公钥，但是私钥不能别人

### 16.非对称加密RSA生成秘钥对

> 不能手动指定，必须由系统生成：公钥和私钥

```java
 //非对称加密三部曲
 //1.创建cipher对象
 Cipher cipher = Cipher.getInstance(TRANSFORMATION);
 //秘钥对生成器
 KeyPairGenerator generator = KeyPairGenerator.getInstance(ALGORITHM);
 //秘钥对
 KeyPair keyPair = generator.generateKeyPair();
 PrivateKey privateKey = keyPair.getPrivate();
 PublicKey publicKey = keyPair.getPublic();
 
 //获取公钥和私钥字符串
 String priateKeyStr = Base64.encode(privateKey.getEncoded());
 String publicKeyStr = Base64.encode(publicKey.getEncoded());
```

### 17.非对称加密RSA加密

> 公钥加密和私钥加密

```java
 public static String encryptByPrivateKey(String input, PrivateKey privateKey) {
  String encode;
  try {
   //非对称加密三部曲
   //1.创建cipher对象
   Cipher cipher = Cipher.getInstance(TRANSFORMATION);
   //2.初始化加密/解密模式
   cipher.init(Cipher.ENCRYPT_MODE, privateKey);//私钥加密
   //3.加密/解密 
   byte[] encryptByPrivateKey = cipher.doFinal(input.getBytes());
   encode = Base64.encode(encryptByPrivateKey);
   return encode;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
 
 
 public static String encryptByPublicKey(String input, PublicKey publicKey) {
  String encode;
  try {
   //非对称加密三部曲
   //1.创建cipher对象
   Cipher cipher = Cipher.getInstance(TRANSFORMATION);
   //2.初始化加密/解密模式
   cipher.init(Cipher.ENCRYPT_MODE, publicKey);//私钥加密
   //3.加密/解密 
   byte[] encryptByPrivateKey = cipher.doFinal(input.getBytes());
   encode = Base64.encode(encryptByPrivateKey);
   return encode;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }


```

### 18.非对称加密RSA分段加密

> RSA每次最大只能加密117个字节

> 超过117字节，分段加密

```java
 public static String encryptByPrivateKey(String input, PrivateKey privateKey) {
  String encode;
  try {
   byte[] bytes = input.getBytes();
   //非对称加密三部曲
   //1.创建cipher对象
   Cipher cipher = Cipher.getInstance(TRANSFORMATION);
   //2.初始化加密/解密模式
   cipher.init(Cipher.ENCRYPT_MODE, privateKey);//私钥加密
   //3.分段加密
   int offset = 0;//当前加密位置
   //缓冲区
   byte[] buffer = new byte[1024];
   ByteArrayOutputStream baos = new ByteArrayOutputStream();
   while(bytes.length - offset > 0){
    if(bytes.length - offset >= MAX_ENCRYPT_SIZE){
     //加密完整块
     buffer = cipher.doFinal(bytes, offset, MAX_ENCRYPT_SIZE);//加密117字节
     offset += MAX_ENCRYPT_SIZE;
    }else{
     //最后一块
     buffer = cipher.doFinal(bytes, offset, bytes.length - offset);
     offset = bytes.length;
    }
    baos.write(buffer);
   }
   
   encode = Base64.encode(baos.toByteArray());
   return encode;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
```

### 19.非对称加密RSA分段解密

```java
 public static String decryptByPrivateKey(String input, PrivateKey privateKey) {
  String encode;
  try {
   byte[] bytes = Base64.decode(input);
   //非对称加密三部曲
   //1.创建cipher对象
   Cipher cipher = Cipher.getInstance(TRANSFORMATION);
   //2.初始化加密/解密模式
   cipher.init(Cipher.DECRYPT_MODE, privateKey);//私钥解密
   //3.分段加密
   int offset = 0;//当前加密位置
   //缓冲区
   byte[] buffer = new byte[1024];
   ByteArrayOutputStream baos = new ByteArrayOutputStream();
   while(bytes.length - offset > 0){
    if(bytes.length - offset >= MAX_DECRYPT_SIZE){
     //加密完整块
     buffer = cipher.doFinal(bytes, offset, MAX_DECRYPT_SIZE);//加密117字节
     offset += MAX_DECRYPT_SIZE;
    }else{
     //最后一块
     buffer = cipher.doFinal(bytes, offset, bytes.length - offset);
     offset = bytes.length;
    }
    baos.write(buffer);
   }
   
   encode = baos.toString();
   return encode;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
```

### 20.非对称加密保存秘钥对

> 每次都生成秘钥对：安卓加密有肯能IOS不能解密

> 第一次生成存储起来

```java
  KeyFactory kf = KeyFactory.getInstance(ALGORITHM);
   //字符串秘钥转成对象类型
   
   PrivateKey privateKey = kf.generatePrivate(new PKCS8EncodedKeySpec(Base64.decode(PRIVATE_KEY)));
   PublicKey publicKey = kf.generatePublic(new X509EncodedKeySpec(Base64.decode(PUBLIC_KEY)));

```

### 21.消息摘要介绍

> MessageDigest：消息摘要，摘要信息（唯一的），软件用判断正版盗版软件

> 三个算法：md5、sha1、sha256

> 特点：

* 不可逆（通过密文不能推出明文，只能撞库）
* 加密后密文长度固定，1kb字符串和1G字符串加密结果长度一样

### 22.消息摘要md5的使用

```java
 public static String md5(String input) {
  try {
   StringBuilder stringBuilder = new StringBuilder();
   //获取消息摘要对象
   MessageDigest md5 = MessageDigest.getInstance(ALGORITHM);
   byte[] digest = md5.digest(input.getBytes());
   String hex = HexUtils.toHex(digest);
   //System.out.println(hex);
   return hex;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }
```

### 23.获取文件md5值

```java
 public static String md5File(String filePath){
  FileInputStream fis = null;
  try {
   fis = new FileInputStream(filePath);
   MessageDigest md5 = MessageDigest.getInstance(ALGORITHM);
   byte[] buffer = new byte[1024];
   int len = 0;
   while((len = fis.read(buffer)) != -1){
    md5.update(buffer, 0, len);
   }
   
   byte[] digest = md5.digest();
   //转成16进制
   String hex = HexUtils.toHex(digest);
   return hex;
  } catch (Exception e) {
   e.printStackTrace();
  } finally{
   IoUtils.close(fis);
  }
  return null;
 }
```

### 24.消息摘要sha1和sha256的使用

> md5:16（加密后密文长度16个字节），32（密文转成16进制32个字节）

> sha1:20（加密后密文长度20个字节），40（密文转成16进制40个字节）

> sha256:32（加密后密文长度32个字节），64（密文转成16进制64个字节）

### 25.消息摘要应用实战

> 开发中使用哪个算法：常用md5

> 应用场景：用户登录/注册，用户密码必须加密传输

> 只要是用户密码必须使用md5（不可逆的），服务器存储的是密文

```java
 InputStream ins = null;
 String usrename = "android104";
 String password = "123456";
 try {
  String url = "http://120.77.241.119/EncryptServer/login?username=" 
     + usrename + "&password=" + MD5Utils.md5(password);
  URL url2 = new URL(url);
  HttpURLConnection conn = (HttpURLConnection) url2.openConnection();
  System.out.println(url2.toURI().toString());
  ins = conn.getInputStream();
  String result = IoUtils.convertStreamToString(ins);
  System.out.println(result);
 } catch (Exception e) {
  e.printStackTrace();
 } finally {
  IoUtils.close(ins);
 }

```

> 撞库破解md5：不可能穷尽所有密文，加密多次，加盐

### 26.数字签名

> RSA数字签名：消息摘要和非对称加密的组合（SHA256withRSA）

> 作用：校验参数是否被篡改，保证数据传输安全

```java
  public static boolean verity(String input, PublicKey publicKey, String sign) {
  try {
   //1.获取数字签名对象
   Signature signature = Signature.getInstance(ALGORITHM);
   //2.初始化校验方法:必须使用公钥
   signature.initVerify(publicKey);
   signature.update(input.getBytes());
   //3.开始校验
   boolean verify = signature.verify(Base64.decode(sign));
   //System.out.println("校验结果:"+verify);
   return verify;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return false;
 }
 

 public static String sign(String input, PrivateKey privateKey) {
  try {
   //1.获取数字签名对象
   Signature signature = Signature.getInstance(ALGORITHM);
   //2.初始化签名:必须使用使用
   signature.initSign(privateKey);
   signature.update(input.getBytes());
   //3.开始签名
   byte[] sign = signature.sign();
   String encode = Base64.encode(sign);
   //System.out.println("sign="+encode);
   return encode;
  } catch (Exception e) {
   e.printStackTrace();
  }
  return null;
 }

```

### 27.数字签名流程图分析

> RSA数字签名流程图：

![](http://img.blog.csdn.net/20170329225648747?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvYmFpZHVfMjc0MTk2ODE=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

### 28.数字签名应用实战-时间戳

> 登录url，抓包可以重复登录

> 如何避免抓包重复登录：添加时间戳

> 设置登录超时时间：比如20秒钟

> 对登录信息（用户名、密码、时间戳 签名）

```java
 InputStream ins = null;
  String usrename = "android104";
  String password = "123456";
  System.out.println(System.currentTimeMillis());
  StringBuilder stringBuilder = new StringBuilder();
  stringBuilder.append("username="+usrename)
  .append("&password="+MD5Utils.md5(password))
  .append("&timestamp="+System.currentTimeMillis());
  
  String input = stringBuilder.toString();
  
  String sign = SignatureUtils.sign(input);
  
  try {
   String url = "http://120.77.241.119/EncryptServer/login_v5?"+input+"&sign="+sign;
   URL url2 = new URL(url);
   HttpURLConnection conn = (HttpURLConnection) url2.openConnection();
   System.out.println(url2.toURI().toString());
   ins = conn.getInputStream();
   String result = IoUtils.convertStreamToString(ins);
   System.out.println(result);
  } catch (Exception e) {
   e.printStackTrace();
  } finally {
   IoUtils.close(ins);
  }

```

### 29.数字签名应用实战-避免抓包

> 对提交参数md5：如果用户没有登录过，存储到数据库；如果登录过不让登录，该url已经失效

```java
 String url = "http://120.77.241.119/EncryptServer/login_v6?"+input+"&sign="+sign;
   URL url2 = new URL(url);
   String md5 = MD5Utils.md5(input+"&sign="+sign);
   System.out.println(md5);
   HttpURLConnection conn = (HttpURLConnection) url2.openConnection();
   System.out.println(url2.toURI().toString());
   ins = conn.getInputStream();
   String result = IoUtils.convertStreamToString(ins);

```

> 手机验证码

### 30.加密算法总结

> 对称加密（DES、AES）：

* 1.优先使用DES，如果提高安全度使用AES
* 2.可逆：开发中只要可逆都可以选择对称加密，缓存联系人信息

> 非对称RSA

* 1.可逆：公钥加密私钥解密；私钥加密公钥解密
* 2.秘钥对：公钥和私钥，不能手动指定，必须由系统生成
* 3.加密速度慢：不能加密大文件
* 4.分段加密：每次最大加密长度117字节
* 5.分段解密：每次最大解密长度128字节
* 应用场景：一般很少使用RSA加密和解密，用的最多的是它的数字签名

> 消息摘要：

* md5:16个字节，转成16进制32个字节
* sha1：20个字节，转成16进制40个字节
* sha256：32个字节，转成16进制64个字节
* 应用：md5使用最多
* 特点：不可逆，比如微信缓存用户密码，下一次不需要重新输入登录
* 避免撞库：加密多次，加盐

> 数字签名

* 为了校验参数安全：支付传递参数，有可能被篡改
* 签名：必须使用私钥
* 校验：必须使用公钥
* 最常用算法SHA256withRSA
