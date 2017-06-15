---
article_image : "fixing-corrupted-partition-on-virtual-machine.jpg"
author : "Jeferson"
date : "2016-07-28T14:07:04+02:00"
news_keywords : ["vagrant", "vm", "ubuntu"]
pinned : "notpinned"
project : ""
resources:
  - "Ubuntu ISOs": "https://www.ubuntu.com/download/desktop"
  - "fsck on linux.die.net": "https://linux.die.net/man/8/fsck"
series : []
tags : ["vagrant", "vm", "ubuntu"]
title : "Fixing a corrupted partition on a virtual machine"

---

If you ever find the following error while using vagrant or simply when booting a virtual machine, we'll later see how to solve it.
{{<highlight sh>}}
Couldn't remount RDWR because of unprocessed orphan inode list.
{{</highlight>}}
Download an Ubuntu ISO
Boot the virtualmachine from the ISO file: Settings -> Storage -> Add CD/DVD Device -> Choose disk

<!--more-->

Umount /dev/sda1:
{{<highlight sh>}}
sudo umount /dev/sda1
{{</highlight>}}
Check damaged partition
{{<highlight sh>}}
fsck /dev/sda1
{{</highlight>}}
You'll see some questions, you should answer yes to everything. When if finishes, we'll boot the vm from the hdd. It's could happen that it asks us for the login, in that case you should login using a visual interface. Once we log in, we save the state of the vm and the next time we'll be able to use vagrant just fine.
