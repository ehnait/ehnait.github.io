---
title: '解决.gitignore修改后无法生效的问题'
categories: 
  - Git
tags:
  - Git
---

使用git的过程中, 为了避免垃圾文件的上传,我们可以手动配置.gitignore忽略一些文件或者文件夹.
但是有时在使用过称中，需要对.gitignore文件进行再次的修改。
这时候我们需要先把缓存区清空, git才会重新读取.gitignore的新规则, .gitignore才会真正生效。

```bash
git rm -r --cached .  #清除缓存
git add . #重新trace file
git commit -m "update .gitignore" #提交和注释
git push origin master #可选，如果需要同步到remote上的话
```

[gitignore模板集合](https://github.com/github/gitignore){: .btn .btn--primary}{: .align-center}
