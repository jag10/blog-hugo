---
article_image : "installing-magento2-on-cwp.jpg"
author : "Jeferson"
date : "2016-03-24T12:34:39+02:00"
news_keywords : ["magento2", "cwp", "php7"]
pinned : "notpinned"
project : ""
resources : []
series : []
tags : ["magento2", "cwp", "php7"]
title : "Installing magento2 on cwp"

---
## Getting started
In this post I'll explain how to install magento2 in CWP, using php7 and mysql 5.6. Firstly, we need to compile php with the correct extensions magento2 needs. If you use this configure command with php7, magento2 will work like a charm:
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
Of course you can change paths, but you need at least these extensions.

## Instalando magento2

Then, you can proceed to download and install magento2, it's pretty straight forward if your server meets the requirements:

https://www.magentocommerce.com/download

After you install magento2, it will complain about permissions. Magento2 ask permissions on directories to be set as 0700, but this won't work with many hosting plans (those using plesk, cPanel, etc). So we have to change all folder and files permissions with this command:
{{<highlight sh>}}
find /path/to/magento -type f -exec chmod 644 {} \;
find path/to/magento -type d -exec chmod 755 {} \;
{{</highlight>}}

Then, we'll tell magento2 to create files with these permissions. We can do that in the following file:
{{<highlight sh>}}

/vendor/magento/framework/Filesystem/DriverInterface.php
(WRITEABLE_DIRECTORY_MODE and WRITEABLE_FILE_MODE)

/lib/internal/Cm/Cache/Backend/File.php
(directory_mode and file_mode)
{{</highlight>}}

 And there you have it, a magento2 install running in a 3€ VPS. For me, it loads in about 3-4 seconds after caché is working, which is good for just 3€/month.
