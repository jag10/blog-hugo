+++
article_image = "facebook-sharer-and-ipv6-issue.png"
author = "Jeferson"
date = "2015-08-11T10:58:34+02:00"
description = ""
news_keywords = []
pinned = "notpinned"
project = ""
resources = []
series = []
tags = ["facebook", "ipv6", "plesk"]
title = "Facebook sharer and IPv6 issue"

+++

Last week all facebook buttons on domains on ALL of our servers stopped working. I always got a 404 response when facebook crawler tried to visit our domains. This happened in our 2 dedicated servers from 1and1. At first, my mates were trying to figure out if it was a joomla issue, but they finally couldn't solve it, so they asked me to investigate it. My first thought was: you got a 404? let's check logs for those domains and we'll see what happens for sure. I checked those files and I couldn't see any 404 error, the visit wasn't even logged. Shit happens.
So, I started surfing the internet, just to find that 404 error from facebook crawler is really common and has multiple causes. After some hours investigating, I remembered I had work to do, so I let this issue apart. The next day I just saw it. The visit wasn't logged in the domain log BUT it should be logged somewhere else, it just had to be. I headed for server general log, (under /var/log) and I spotted it right there. Ok, that was a start. Then I tried to visit the link myself with curl and surprisingly, I got a 200 answer, everything ok.
{{<highlight sh>}}
2001:8d8:90b:c900::2a:19d1 - - [29/Jul/2015:17:44:55 +0200] "GET /hello.html HTTP/1.0" 404 1208 "-" "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
2001:8d8:90b:c900::2a:19d1 - - [29/Jul/2015:17:49:39 +0200] "GET /hello.html HTTP/1.0" 200 384 "-" "curl/7.19.7 (x86_64-redhat-linux-gnu) libcurl/7.19.7 NSS/3.16.1 Basic ECC zlib/1.2.3 libidn/1.18 libssh2/1.4.2"
{{</highlight>}}
Ok, that was weird. First thing I noticed, no matter if I used curl or facebook crawler, the same ipv6 was logged, and actually was the IP given for the server. Then I remembered nginx, it acts as a reverse proxy, so that explained the ips issue. Next step was disabling nginx, just to see real IPs. I got this:
{{<highlight sh>}}
2a03:2880:2110:dff3:face:b00c:0:1 - - [29/Jul/2015:17:55:11 +0200] "GET /hello.html HTTP/1.1" 404 1208 "-" "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
84.x.x.x- - [29/Jul/2015:17:54:52 +0200] "GET /hello.html HTTP/1.1" 200 361 "-" "curl/7.19.7 (x86_64-redhat-linux-gnu) libcurl/7.19.7 NSS/3.16.1 Basic ECC zlib/1.2.3 libidn/1.18 libssh2/1.4.2"
{{</highlight>}}

"GET /hello.html ..." in each request, yet one of them gave 404 and the other one gave 200. Only thing which changed was the ip, so I thought it had to be an ipv6 issue.
NOTE: all 200 answers were logged correctly in the domain's log, but the 404 were logged in the general server log.
Next step: check apache configuration for the domain. And I found the problem there, our virtual hosts weren't listening in the ipv6 address, that's why it never found anything, the ipv6 didn't match any virtualhost, so it went directly to default site, and obviously, it couldn't find anything there.
Now, the solution is pretty simple in plesk. You go to domain -> hosting configuration and you can enable ipv6 support. After that, everything was working like a charm. Easy solution, but the problem was hard to spot.
## TL;DR
Enable ipv6 for your domains, you can do it through Plesk or through apache conf files. It is very simple, just add the ipv6 like the ipv4 is configurated for each virtualhost.
