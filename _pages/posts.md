---
title: "帖子"
permalink: /posts/
layout: splash
hidden: true
header:
  overlay_image: /assets/images/header-image-3.jpg
  caption: "Photo credit: [**Wallhere**](https://wallhere.com/)"

excerpt:
  最近的20篇帖子。 <br />
  主要涉及技术主题, 可以评论和分享它们。
  如果需要更长、更详细的写作，请查看<big><a href="/articles/">Articles</a></big>。<br />
  想查看更多 —— <br /><br />
  <a href="/tags/" class="btn btn--light-outline btn--small">按Tag浏览→</a>   <a href="/year-archive/" class="btn btn--light-outline btn--small">按年份浏览→</a> <a href="/categories/" class="btn btn--light-outline btn--small">按类别浏览→</a> 
---

[//]: # (<a href="#" class="btn btn--primary">Link Text</a>)


{% if paginator %}
    {% assign posts = paginator.posts %}
{% else %}
    {% assign posts = site.posts %}
{% endif %}

{% assign entries_layout = page.entries_layout | default: 'list' %}
<div class="entries-{{ entries_layout }}">
  {% for post in posts limit:20 %}
    {% include archive-single.html type=entries_layout %}
  {% endfor %}
</div>


{% include paginator.html %}  

[//]: # (分页插件无法运行 https://github.com/mmistakes/minimal-mistakes/discussions/3292)


