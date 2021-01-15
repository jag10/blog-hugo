---
article_image : "getting-0.5s-page-load-time-on-your-blog.png"
author : "Jeferson"
date : "2021-01-15T12:21:32+02:00"
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
Previously, in this [post](articles/getting-1.5s-page-load-time-on-a-basic-vps/) back in 2016
I got the page load of my blog time down from 5s to 1.5s.
On this post, we'll go a step further and we'll bring it down to 0.5s or less.
<br /><br />

{{< figure src="/articles/img/min/getting-0.5s-page-load-time-on-your-blog.png"
title="jarboleda.me performance graphic [gtmetrix.com]" alt="jarboleda.me performance graphic"
width="780" height="241"
>}}
<br /><br />
For that purpose, I used the following technologies:

* [Hugo - Static website generator.](https://gohugo.io/)
* [Github Pages - Static website hosting.](https://pages.github.com/)
* [Cloudflare - CDN & Network protection.](https://www.cloudflare.com/)
* [Imagemagick - Image compresion service.](https://imagemagick.org/script/download.php#macosx)
* [Lazysizes - To lazy load non-critical images.](https://github.com/aFarkas/lazysizes)
<!--more-->
* [Lighthouse - Open-source, automated tool for measuring the quality of web pages.](https://developers.google.com/web/tools/lighthouse)
* [Gtmetrix - Service that analyzes a page's speed performance.](https://gtmetrix.com/)

## Stats before tuning up
![performance after tuning up](/articles/img/min/getting-1.5s-page-load-time-on-a-basic-vps-2.png)
On top of previous optimizations, I decided to go for a static website, after all, most of my content is static.
The only exception is the sidebar, but we'll get into that later.

## Actions taken
* Optimizing images is important to save bandwidth. To do this, I crafted a script to resize all the images used in the blog to minimize their size and maximize their quality.
* Lazy load non-critical images. This allows the browser to load critical resources first, leaving non-critical images for last.
* Preload css and fonts. This allows the browser to fetch resources that will be needed to render the page as soon as possible.
* Cloudflare's Brotli compression for HTLM. JS and CSS are minized with the framework I'm using, so I just need HTML compresion from Cloudflare.
* Cloudflare's cache to optimize response time.
* Defer parsing of JS allows the browser to load the visible content faster. This was easy, I only use a couple of JS and I moved them into the footer.
* Load dynamic content asynchronously once the page is loaded. I achieved this by using JS on my sidebar, including a preloader for cool-looking purposes.

## Stats after tuning up
Well, you can see them on the top image of this post, load time can go down even to 0.4s in the best cases. Also, the complexity of the website is much lower with a static content management system like Hugo.
