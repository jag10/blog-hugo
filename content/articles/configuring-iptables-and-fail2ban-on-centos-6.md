---
article_image : "configuring-iptables-and-fail2ban-on-centos-6.jpg"
author : "Jeferson"
date : "2015-08-10T10:56:10+02:00"
news_keywords : ["iptables", "fail2ban", "centos6"]
pinned : "notpinned"
project : ""
resources:
  - "iptables script on bash.cyberciti.biz": "https://bash.cyberciti.biz/firewall/linux-iptables-firewall-shell-script-for-standalone-server/"
series : []
tags : ["iptables", "fail2ban", "centos6"]
title : "Configuring IPTABLES and fail2ban on centOS 6"

---

In this post I'll explain how to configure iptables along with fail2ban and how to start/stop these services without messing up your chains or configuration.

Iptables should be included in your default Linux OS, and you can easily get fail2ban from standard repos. So, just enable the chains you need on `/etc/fail2ban/jail.local`. Copy the file from `/etc/fail2ban/jail.conf` if it doesn't exist. For example, if you want (you should) activate ssh jail, just add/uncomment this lines to the file:
<!--more-->

{{<highlight sh>}}
[ssh-iptables]
enabled = true
{{</highlight>}}

Don't forget to add yourself to the ignored ips, you do not want to lock out yourself from the server. If this happens to you, go to your vps/server control panel and look for an emergency access, most providers will have one (ovh and 1and1 do). Or you could just simply sit and wait until fail2ban unbans you, just don't keep trying to log in or you'll make the situation worse.
Ok, now you have iptables installed and fail2ban configured. You may wonder what will happen if you reboot your server or if you just restart iptables. Yep, you'll lose all your fail2ban chains. So let's use a script to start and stop iptables, to ensure we don't lose chains and also to make it easier and safer to modify rules.
## Starting iptables and fail2ban
Let's start with the script which will start iptables and fail2ban. We'll define a blacklist, so we can just add ips to a text file and get them locked out from our server. This will be handy in future. After that, we'll block all traffic by default, except output traffic, that won't harm us. Then, we'll block bad packets to prevent attacks and finally, we'll allow some legit traffic (icmp, dns, etc.). You should carefully look at the script below and modify it to fit your needs. This is a standard configuration and should be ok for most basic web servers, allowing mail, passive ftp, ssh, git, mail, etc.
{{<highlight bash>}}
#!/bin/sh

IPT="/sbin/iptables"
SPAMLIST="blockedip"
SPAMDROPMSG="BLOCKED IP DROP"

echo "Starting IPv4 Wall..."
$IPT -F
$IPT -X
$IPT -t nat -F
$IPT -t nat -X
$IPT -t mangle -F
$IPT -t mangle -X

[ -f /script/blocked.ips.txt ] && BADIPS=$(egrep -v -E "^#|^$" /script/blocked.ips.txt)
PUB_IF="eth0"

if [ -f /script/blocked.ips.txt ]; then
	# create a new iptables list
	$IPT -N $SPAMLIST

	for ipblock in $BADIPS
	do
		$IPT -A $SPAMLIST -s $ipblock -j LOG --log-prefix "$SPAMDROPMSG"
		$IPT -A $SPAMLIST -s $ipblock -j DROP
	done

	$IPT -I INPUT -j $SPAMLIST
	$IPT -I OUTPUT -j $SPAMLIST
	$IPT -I FORWARD -j $SPAMLIST
fi

# Block everything by default
$IPT -t filter -P INPUT DROP
$IPT -t filter -P FORWARD DROP
$IPT -t filter -P OUTPUT ACCEPT

# Authorize already established connexions
$IPT -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
$IPT -A OUTPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
$IPT -t filter -A INPUT -i lo -j ACCEPT
$IPT -t filter -A OUTPUT -o lo -j ACCEPT

#Bad packets
$IPT -A INPUT -p tcp -m tcp ! --tcp-flags FIN,SYN,RST,ACK SYN -m state --state NEW -j REJECT --reject-with tcp-reset
$IPT -A INPUT -m state --state INVALID -j DROP
$IPT -A OUTPUT -p tcp -m tcp ! --tcp-flags FIN,SYN,RST,ACK SYN -m state --state NEW -j REJECT --reject-with tcp-reset
$IPT -A OUTPUT -m state --state INVALID -j DROP
$IPT -A FORWARD -m state --state INVALID -j DROP
$IPT -A FORWARD -p tcp -m tcp ! --tcp-flags FIN,SYN,RST,ACK SYN -m state --state NEW -j REJECT --reject-with tcp-reset

$IPT -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT

# ICMP (Ping)
$IPT -t filter -A INPUT -p icmp -j ACCEPT
#$IPT -t filter -A OUTPUT -p icmp -j ACCEPT

# SSH
$IPT -t filter -A INPUT -p tcp --dport 22 -j ACCEPT
#$IPT -t filter -A OUTPUT -p tcp --dport 22 -j ACCEPT

# DNS
#$IPT -t filter -A OUTPUT -p tcp --dport 53 -j ACCEPT
#$IPT -t filter -A OUTPUT -p udp --dport 53 -j ACCEPT
$IPT -t filter -A INPUT -p tcp --dport 53 -j ACCEPT
$IPT -t filter -A INPUT -p udp --dport 53 -j ACCEPT

# HTTP
#$IPT -t filter -A OUTPUT -p tcp --dport 80 -j ACCEPT
$IPT -t filter -A INPUT -p tcp --dport 80 -j ACCEPT

#HTTPS
#$IPT -t filter -A OUTPUT -p tcp --dport 443 -j ACCEPT
$IPT -t filter -A INPUT -p tcp --dport 443 -j ACCEPT

# FTP
#$IPT -t filter -A OUTPUT -p tcp --dport 20:21 -j ACCEPT
$IPT -t filter -A INPUT -p tcp --dport 20:21 -j ACCEPT

# Passive FTP
$IPT -t filter -A INPUT -p tcp -m tcp --dport 30000:30100 -j ACCEPT

# Git
#$IPT -t filter -A OUTPUT -p tcp --dport 9418 -j ACCEPT
$IPT -t filter -A INPUT -p tcp --dport 9418 -j ACCEPT

# Mail SMTP
iptables -t filter -A INPUT -p tcp --dport 25 -j ACCEPT
iptables -t filter -A OUTPUT -p tcp --dport 25 -j ACCEPT

# Mail POP3
iptables -t filter -A INPUT -p tcp --dport 110 -j ACCEPT
iptables -t filter -A OUTPUT -p tcp --dport 110 -j ACCEPT

# Mail IMAP
iptables -t filter -A INPUT -p tcp --dport 143 -j ACCEPT
iptables -t filter -A OUTPUT -p tcp --dport 143 -j ACCEPT

# NTP (server time)
#$IPT -t filter -A OUTPUT -p udp --dport 123 -j ACCEPT

/etc/init.d/fail2ban start

sleep 2

echo "new rules:"
iptables -L -n -v
{{</highlight>}}

After we enable iptables, we'll start fail2ban, give it 2 seconds to load, and then list all the rules, so we can see everything is ok. There are some lines commented, use them if you prefer to deny all output traffic by default and then allow only certain traffic.
## Stopping iptables and fail2ban
Now, when we need to stop both iptables and fail2ban, we'll use the following script. It will flush all rules and echo the new rules to make sure there are no active rules.
{{<highlight bash>}}
#!/bin/sh
/etc/init.d/fail2ban stop

echo "deleting rules..."

iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT

echo "new rules:"
iptables -L -n -v
{{</highlight>}}

If you are going to use these scriptes frequently, I recommend to set an alias for them. For example, if you save these scripts to /home/start.fw, /home/stop.fw, you could add an alias like this:
Edit ~/.bashrc and add the following lines:
{{<highlight bash>}}
alias startfw='/script/start.fw'
alias stopfw='/script/stop.fw'
{{</highlight>}}

Now, when you want to reboot your firewall, just use the command below. Beware, it will delete all of your rules and put the ones you set in the startup script. If you want to add/delete rules, just modify start.fw and restart the firewall.
{{<highlight bash>}}
stopfw && startfw
{{</highlight>}}
