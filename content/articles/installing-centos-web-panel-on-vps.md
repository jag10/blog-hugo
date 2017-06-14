---
article_image : "installing-centos-web-panel-on-vps.jpg"
author : "Jeferson"
date : "2016-03-24T12:28:50+02:00"
news_keywords : ["magento", "cwp", "php7"]
pinned : "notpinned"
project : ""
resources : []
series : []
tags : ["magento", "cwp", "php7"]
title : "Centos web panel with php7 and mysql5.6"

---

Firstly, we'll install centOS Web Panel, just follow the instructions in the CWP website: http://centos-webpanel.com/installation-instructions
After a fresh install, we'll stop CWP to perform the mysqld update:
{{<highlight sh>}}
service cwpsrv stop
{{</highlight>}}

Then, we'll install mysql server repo:
{{<highlight sh>}}
yum install -y wget
wget http://dev.mysql.com/get/mysql57-community-release-el6-7.noarch.rpm
yum localinstall mysql57-community-release-el6-7.noarch.rpm
vim /etc/yum.repos.d/mysql-community.repo
{{</highlight>}}
Now we've installed mysql yum repository, we have to enable the version we want to install. In this case we're installing mysql 5.6, so the repo configuration file should look like this:
{{<highlight sh>}}
yum
[mysql-connectors-community]
name=MySQL Connectors Community
baseurl=http://repo.mysql.com/yum/mysql-connectors-community/el/6/$basearch/
enabled=1
gpgcheck=1
gpgkey=file:/etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
[mysql-tools-community]
name=MySQL Tools Community
baseurl=http://repo.mysql.com/yum/mysql-tools-community/el/6/$basearch/
enabled=1
gpgcheck=1
gpgkey=file:/etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
# Enable to use MySQL 5.5
[mysql55-community]
name=MySQL 5.5 Community Server
baseurl=http://repo.mysql.com/yum/mysql-5.5-community/el/6/$basearch/
enabled=0
gpgcheck=1
gpgkey=file:/etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
# Enable to use MySQL 5.6
[mysql56-community]
name=MySQL 5.6 Community Server
baseurl=http://repo.mysql.com/yum/mysql-5.6-community/el/6/$basearch/
enabled=1
gpgcheck=1
gpgkey=file:/etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
# Note: MySQL 5.7 is currently in development. For use at your own risk.
# Please read with sub pages: https://dev.mysql.com/doc/relnotes/mysql/5.7/en/
[mysql57-community-dmr]
name=MySQL 5.7 Community Server Development Milestone Release
baseurl=http://repo.mysql.com/yum/mysql-5.7-community/el/6/$basearch/
enabled=0
gpgcheck=1
gpgkey=file:/etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
{{</highlight>}}
Now, to check we've enabled the correct repository, we have to use this command:
{{<highlight sh>}}
yum repolist enabled | grep mysql
That should return something like this:
mysql-connectors-community MySQL Connectors Community
mysql-tools-community MySQL Tools Community
mysql56-community MySQL 5.6 Community Server
{{</highlight>}}

Now we can proceed with the update:
{{<highlight sh>}}
yum install mysql-community-server
{{</highlight>}}
In my case, mysqld broke after this, I couldn't start the mysqld service. I checked the log and found this error:
{{<highlight sh>}}
ERROR] InnoDB: auto-extending data file ./ibdata1 is of a different size 640 pages (rounded down to MB) than specified in the .cnf file: initial 768 pages, max 0 (relevant if non-zero) pages!
{{</highlight>}}
The quickfix for this is to add the following line in the /etc/my.cnf, in the [mysqld] block:
{{<highlight sh>}}
innodb_data_file_path = ibdata1:10M:autoextend
{{</highlight>}}


Now you can start mysqld:
{{<highlight sh>}}
service mysqld start
{{</highlight>}}


If the service starts, you should use this command to finish upgrade:
{{<highlight sh>}}
mysql_upgrade
{{</highlight>}}


We're finished with the mysql server update, we can start CWP again:
{{<highlight sh>}}
service cwpsrv start
{{</highlight>}}

Now your server should be accesible at: http://your.ip:2030
Login into the panel with your root credentials and go to PHP Settings -> PHP selector. Firstly, we need to define the flags for the php version we're going to compile. You should add the following extension for php7 because it's needed in some platforms like magento:
{{<highlight sh>}}
./configure
--prefix=/opt/alt/php7/usr
--with-config-file-path=/opt/alt/php7/usr/php
--with-config-file-scan-dir=/opt/alt/php7/usr/php/php.d
--enable-fpm
--enable-mbstring
--enable-zip
--enable-bcmath
--enable-pcntl
--enable-ftp
--enable-exif
--enable-calendar
--enable-sysvmsg
--enable-sysvsem
--enable-sysvshm
--enable-wddx
--with-curl
--with-mcrypt
--with-iconv
--with-gmp
--with-pspell
--with-gd
--with-jpeg-dir=/usr
--with-png-dir=/usr
--with-zlib-dir=/usr
--with-xpm-dir=/usr
--with-freetype-dir=/usr
--enable-gd-native-ttf
--enable-gd-jis-conv
--with-openssl
--with-pdo-mysql=/usr
--with-gettext=/usr
--with-zlib=/usr
--with-bz2=/usr
--with-recode=/usr
--with-mysqli
--with-mysql-sock=/var/lib/mysql/mysql.sock
--enable-intl
--with-xsl
{{</highlight>}}

 In case you want to use php 5.6, you should add the following flag:
 {{<highlight sh>}}
--enable-intl
{{</highlight>}}

Now, you can click on 'Install dependencies' to install packages needed to compile PHP. After that, you can select php7 and compile it. When the process finishes, you can use php7 in your website adding the following line in your .htaccess:
{{<highlight sh>}}
AddHandler application/x-httpd-php7 .php
{{</highlight>}}

And you're done! Now you have a fresh server with php7 and mysql 5.6. Theese upgrades will give you a nice boost on performance.
