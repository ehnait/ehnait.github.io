---
title: "帖子"
permalink: /posts/
layout: splash
hidden: true
header:
  #overlay_color: "#000"
  #overlay_filter: "0.3"
  overlay_image: /assets/images/header-image-16.jpg
  #image: /assets/images/header-image-7.jpg
  caption: "Photo credit: [**Wallhere**](https://wallhere.com/)"

excerpt:
  最近的6篇帖子或留言。 <br />
  主要涉及技术主题, 可以评论和分享它们。<br />
  如果想查看更多 —— <br /><br />
  <a href="/tags/" class="btn btn--light-outline btn--small">按Tag浏览帖子 →</a>   <a href="/year-archive/" class="btn btn--light-outline btn--small">按年份浏览帖子 → </a> 
---

[//]: # (<a href="#" class="btn btn--primary">Link Text</a>)


{% if paginator %}
    {% assign posts = paginator.posts %}
{% else %}
    {% assign posts = site.posts %}
{% endif %}

{% assign entries_layout = page.entries_layout | default: 'list' %}
<div class="entries-{{ entries_layout }}">
  {% for post in posts limit:6 %}
    {% include archive-single.html type=entries_layout %}
  {% endfor %}
</div>


{% include paginator.html %}  

[//]: # (分页插件无法运行 https://github.com/mmistakes/minimal-mistakes/discussions/3292)


