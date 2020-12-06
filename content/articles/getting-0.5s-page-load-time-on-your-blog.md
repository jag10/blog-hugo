---
article_image : "getting-0.5s-page-load-time-on-your-blog.png"
author : "Jeferson"
date : "2019-02-16T12:21:32+02:00"
news_keywords : ["performance", "Hugo", "githubPages"]
pinned : "notpinned"
project : ""
resources:
  - "Analyze Performance of your website on gtmetrix.com": "https://gtmetrix.com/"
  - "Check GZIP compression": "https://checkgzipcompression.com/"
  - "GZIP compression checker": "http://www.websiteplanet.com/webtools/gzip-compression/"
  - "Cloudflare": "https://www.cloudflare.com/"
series : []
tags : ["performance", "Hugo", "github Pages", "CloudFlare"]
title : "Getting 0.5 seconds load time on your blog"

---
In my previous [post](articles/getting-1.5s-page-load-time-on-a-basic-vps/) back in 2016 I got page load time down from 5s to 1.5, and here my objective is to get around 0.5s.
<br /><br />
{{< figure src="/articles/img/min/getting-0.5s-page-load-time-on-your-blog.png"
title="jarboleda.me performance graphic" alt="jarboleda.me performance graphic"
width="780" height="310"
>}}

For that purpose, I´ll be using the following technologies:

* [Hugo](https://gohugo.io/)
* [Github Pages](https://pages.github.com/)
* [Cloudflare](https://www.cloudflare.com/)

<!--more-->

## Stats before tuning up
![performance after tuning up](/articles/img/min/getting-1.5s-page-load-time-on-a-basic-vps-2.png)
On top of previous optimizations, I decided to go for a static website, after all, most of my content is static. The only exception is the sidebar, but we'll get to that later

## Actions taken
* Optimizing images is important to save bandwidth. To do this, I crafted a script to resize all the images used in the blog to minimize their size and maximize their quality.
* Cloudflare's Brotli compression for HTLM. JS and CSS are minized with the framework I'm using, so I just need HTML from Cloudflare.
* Cloudflare's cache to optimize response time.
* Defer parsing of JS allows the browser to load the visible content faster. This was easy, I only use a couple of JS and I moved them into the footer.
* Load dynamic content asynchronously once the page is loaded. I achieves that using JS on my sidebar, including a preloader for cool-looking purposes

## Stats after tuning up
Well, you can see them on the top image of this post, load time can go down even to 0.4s in the best cases. Also, the complexity of the website is much lower with a static content management system like Hugo.
