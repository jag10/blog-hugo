---
article_image : "installing-ubuntu-16.04-on-odroid-xu3-lite.jpg"
author : "Jeferson"
date : "2016-07-18T13:37:52+02:00"
news_keywords : ["ubuntu", "odroid", "mate"]
pinned : "notpinned"
project : ""
resources : []
series : []
tags : ["ubuntu", "odroid", "mate"]
title : "Installing ubuntu 16.04 on odroid xu3 lite"

---

## Choosing an image
Ubuntu 16.04 mate has just been released by odroid team, including support for xu3/xu4 boards and their lite versions. In this case we're going to test Ubuntu 16.04 on odroid xu3 lite, which is the board I own. We'll install it on an eMMC module, which is something like an small ssd (not really the same, eMMC isn't as fast as ssd is). This module will give us a boost on performance, although we can also install Ubuntu on a SD card (class 10).
Firslty, we need to download the image we want to install:
http://de.eu.odroid.in/ubuntu_16.04lts/
From the list above I took the image I was looking for, which is the complete version for odroid xu3:

* [ubuntu-16.04-mate-odroid-xu3-20160708.img.xz](http://de.eu.odroid.in/ubuntu_16.04lts/ubuntu-16.04-mate-odroid-xu3-20160708.img.xz)

## Writing the image on odroid board
The next step will be to uncompress the image. This is very important because if we try to write a compressed image into the eMMC module, it won't work at all. So, to uncompress it, use the following command:
 [jag@2ndChance distros]$ unxz ubuntu-16.04-mate-odroid-xu3-20160708.img.xz
Ok, now we are ready to install the linux image. The easiest way to do it is using the dd command:
{{<highlight sh>}}
[jag@2ndChance distros]$ sudo dd if=ubuntu-16.04-mate-odroid-xu3-20160708.img of=/dev/sdc bs=1M conv=fsync
[jag@2ndChance distros]$ sync
[jag@2ndChance distros]$ sync
[jag@2ndChance distros]$ sync
[jag@2ndChance distros]$ sync
{{</highlight>}}
## Checking the result
It is very important to use the sync command multiple times after dd so we make sure we flush all the cache content and write the complete image into the eMMC module.
Now we need to verify the image was correctly written into the eMMC module, we'll use the dd command again:
{{<highlight sh>}}
[jag@2ndChance distros]$ sudo dd if=/dev/sdc bs=512 count=$((`stat -c%s ubuntu-16.04-mate-odroid-xu3-20160708.img`/512)) | md5sum
[sudo] password for jag:
8968192+0 registros leídos
8968192+0 registros escritos
4591714304 bytes (4,6 GB) copiados, 106,332 s, 43,2 MB/s
ff988a4039d9bcd6978910447930f5d5 -
[jag@2ndChance distros]$ dd if=ubuntu-16.04-mate-odroid-xu3-20160708.img bs=512 count=$((`stat -c%s ubuntu-16.04-mate-odroid-xu3-20160708.img`/512)) | md5sum
8968192+0 registros leídos
8968192+0 registros escritos
4591714304 bytes (4,6 GB) copiadosff988a4039d9bcd6978910447930f5d5 -
, 26,0306 s, 176 MB/s
[jag@2ndChance distros]$
{{</highlight>}}

We we did with the first command is writing the content of the eMMC module (/dev/sdc) into stdout, piping that output into md5sum command, which gives us the md5 for the content of the eMMC module. With the second command, we read the image from local disk and write it into stdout to pipe it into md5sum, this gives us the md5 for the image we downloaded. Now we can compare both md5 values to check if they are the same,
As you can see, md5 hashes are the same, so everything is ok.
If everything worked out, we'll be able to connect to the board with an ssh connection. In my case I have a static IP assigned for my board, but if you don't know which IP has your odroid, you'll have to log in the router and check it out. You can also use utilities like nmap to discover new devices on the local network. Once we know the IP for the board, we can log in with the following credentials:
root:odroid

I've been testing Ubuntu on the board and the first impression was really good. They've solved some issues with the hdmi output. In previous versions I had a lot of trouble to make it work, but now it was Plug & Play. On the other hand, I've detected an issue with Ethernet connection, which doesn't work always as expected.

## UPDATE

* After some updates and checking the wires, the Ethernet connection works just fine.
