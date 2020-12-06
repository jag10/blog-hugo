---
article_image : "getting-1.5s-page-load-time-on-a-basic-vps.png"
author : "Jeferson"
date : "2016-02-27T12:21:32+02:00"
news_keywords : ["performance", "vps", "processwire"]
pinned : "notpinned"
project : ""
resources:
  - "Analyze Performance of your website on gtmetrix.com": "https://gtmetrix.com/"
  - "Check GZIP compression": "https://checkgzipcompression.com/"
  - "GZIP compression checker": "http://www.websiteplanet.com/webtools/gzip-compression/"
series : []
tags : ["performance", "vps", "processwire"]
title : "Getting 1.5s page load time on a basic vps"

---
## The problem
As you can see on the graphics, I had 5s load time for my home page, which is kind of basic. It wasn't that bad if you look at the packages my server runs: gitlab, Roundcube's webmail, sentora (open source control panel) and piwik (stats management).

__Note:__ Those 11s peaks you see there were produced while I was doing load tests on my server.

My environment's specs are:
<!--more-->


* 1 GB RAM VPS
* CentOS Linux release 7.2.1511 (Core)
* 1 vCore @2.4 GHz
* KVM OpenStack
* 10 GB ssd
* 1000 Mbps bandwith

## Stats before tuning up
This were my stats before tuning up ProcessWire:
performance before tuning up
![performance before tuning up](/articles/img/min/getting-1.5s-page-load-time-on-a-basic-vps-1.png)
First thing I did was go to gtmetrix.com to find out why my site was slow. These were the firsts conclusions:

* Optimizing images is important to save bandwidth. ProcessWire is great for this as it allows to resize images in an easy way. For example, for the images on each blog post, I used the 'size' method on image files to resize the image: echo $post->post_image->size(573, 0, array('quality' :> 70))->url; That simple line outputs the post image, resized and with a quality of 70% (yup, PW is awesome).
* Gzip compression is an easy way to get huge improvements on performance. I enabled this through .htaccess with the following line:
AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/x-javascript text/javascript
* This allows me to gzip html, xl, css, JS, etc.
* Avoiding redirections on landing page is also very good for performance (I was redirecting jglab.me to jglab.me/home, wasting about 600ms)
* Defer parsing of JS allows the browser to load the visible content faster. This was easy, I only use a couple of JS and I moved them into the footer.

## Stats after tuning up

These modifications allowed my server to load the page in 3s, which was good but it could be better. So I thought those awesome sidebars I use must consume a lot of resources. This is how they work:

* Popular posts looks for every blog post on the site and then uses piwik's API to sort them out based on their visits. This is obviously a heavy task that should not be done everytime users visit homepage. So I enabled ProcessWire's cache on this template. Now the sidebar template is cached and is only rendered once a day.
* The label cloud works in a similiar way, it looks for every label on posts and then finds out which ones are the most popular. I setted this template's cache to 1 day.

These last improvements resulted into a huge performance boost, making my homepage load in just 1.5s. This is pretty impressive for a 3€/month VPS. This is why I love ProcessWire. It's simple, easy to use, yet very powerful and very fast.
![performance after tuning up](/articles/img/min/getting-1.5s-page-load-time-on-a-basic-vps-2.png)
