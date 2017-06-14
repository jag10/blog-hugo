---
article_image : "transferring-files-with-ftp-through-bash-expect-script.png"
author : "Jeferson"
date : "2015-08-30T11:03:31+02:00"
news_keywords : ["backups", "ftp", "bash"]
pinned : "notpinned"
project : ""
resources : []
series : []
tags : ["backups", "ftp", "bash"]
title : "Transferring files with FTP through bash expect script"

---

If you use to transfer backups through ftp, it can be very handy to write a bash script to put a file in a remote server in an easy way. With this script, transferring a file will be as easy as this:
{{<highlight sh>}}
./ftpConnect localFile remoteFile
{{</highlight>}}
In the script you'll need to define some data: your FTP server's IP and a valid user and password combination.
{{<highlight bash>}}
#!/bin/bash
#use absolute paths (i.e. /var/www/vhosts/) for params:
localFile=$1
remoteFile=$2

echo "Bash script about to invoke ftp with expect"

/bin/cat &lt;&lt; EOF | /usr/bin/expect
spawn /usr/bin/ftp

set timeout -1

expect "ftp&gt; "
send "open\r"

expect "(to) "
send "aaa.bbb.ccc.ddd\r"

send "user\r"

expect "Password:"
send "password\r"

expect "ftp&gt; "
send "binary\r"

expect "ftp&gt; "
send "put $localFile $remoteFile\r"

expect "ftp&gt; "
send "bye\r"

interact
EOF

echo "Bash script call to ftp through expect complete. Continuing with additional processing"
{{</highlight>}}

You have to set timeout -1 so expect doesn't close while you transfer files. Also, I had trouble when transferring files to a FTP Windows server until I used binary mode. You should check the integrity of your files once you have successfully transferred them, you may find out they are corrupt. As I said, I solved this issue using binary mode.

There you go, now you can easily transfer files to your FTP server. Remember to set permissions correctly, you and only you should be able to read this file, since it contains a valid user and password for your FTP server.
I use this to backup database dumps, but you can transfer whatever you want.

*This script works with FileZilla server. You may have to tweak it to work with your FTP server.
