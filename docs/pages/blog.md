---
layout: page
title: Blog
description: 
---

<ul>
  {% for post in site.posts %}
    <li>
<!--      <a href="{{site.url}}{{post.url}}">{{ post.title }}</a>
-->
			<a href="{{ BASE_PATH }}/_posts/">{{ post.title }}</a>		
    </li>
  {% endfor %}
</ul>