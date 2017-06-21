---
article_image : "installing-centos-web-panel-on-vps.jpg"
author : "Jeferson"
date : "2016-03-24T12:28:50+02:00"
news_keywords : ["magento", "cwp", "php7"]
pinned : "notpinned"
project : ""
resources:
  - "CWP installation": "http://centos-webpanel.com/installation-instructions"
  - "Installing MySQL on Linux Using the MySQL Yum Repository": "https://dev.mysql.com/doc/mysql-repo-excerpt/5.6/en/linux-installation-yum-repo.html"
  - "Compiling PHP 7 on CentOS": "http://www.shaunfreeman.name/compiling-php-7-on-centos/"
series : []
tags : ["magento", "cwp", "php7"]
title : "Centos web panel con php7 y mysql5.6"

---
## Instalando CWP
En primer lugar, vamos a instalar CWP, simplemente hay que seguir las instrucciones del sitio web de CWP: http://centos-webpanel.com/installation-instructions

## Instalando mysql 5.6
Después de una instalación limpia, vamos a detener CWP para actualizar mysql.
{{<highlight sh>}}
service cwpsrv stop
{{</highlight>}}

Ahora vamos a instalar el repositorio de mysql
<!--more-->

{{<highlight sh>}}
yum install -y wget
wget http://dev.mysql.com/get/mysql57-community-release-el6-7.noarch.rpm
yum localinstall mysql57-community-release-el6-7.noarch.rpm
vim /etc/yum.repos.d/mysql-community.repo
{{</highlight>}}

Ahora que tenemos el repositorio, vamos a elegir qué versión queremos instalar. En este caso, vamos a instalar mysql 5.6, por lo que el fichero debe quedar así:
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
Ahora, para comprobar que hemos activado el repositorio correcto, utilizaremos el siguiente comando:
{{<highlight sh>}}
yum repolist enabled | grep mysql

mysql-connectors-community MySQL Connectors Community
mysql-tools-community MySQL Tools Community
mysql56-community MySQL 5.6 Community Server
{{</highlight>}}

Ahora podemos proceder con la actualización.
{{<highlight sh>}}
yum install mysql-community-server
{{</highlight>}}
En my caso, mysqld dejó de funcionar después de hacer esto. Analizando el log encontré este error:
{{<highlight sh>}}
ERROR] InnoDB: auto-extending data file ./ibdata1 is of a different size 640 pages (rounded down to MB) than specified in the .cnf file: initial 768 pages, max 0 (relevant if non-zero) pages!
{{</highlight>}}
El quickfix para esto es añadir la siguiente línea en el fichero ``/etc/my.cnf``, en el bloque [mysqld]:
{{<highlight sh>}}
innodb_data_file_path = ibdata1:10M:autoextend
{{</highlight>}}

Ahora se puede iniciar mysqld.
{{<highlight sh>}}
service mysqld start
{{</highlight>}}

Para terminar con la actualización:
{{<highlight sh>}}
mysql_upgrade
{{</highlight>}}

Ya hemos acabado con mysql, ahora podemos volver a iniciar CWP:
{{<highlight sh>}}
service cwpsrv start
{{</highlight>}}

## Configurando php7

Ahora tu servidor debería ser accesible en http://your.ip:2030
Identifícate en el panel con tus credenciales y ve a PHP Settings -> PHP selector. En primer lugar, hay que definir las flags para la versión php que vamos a compilar.
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

En caso de que quieras usar php 5.6, hay que añadir la siguiente flag:
 {{<highlight sh>}}
--enable-intl
{{</highlight>}}

Ahora puedes hacer click en 'Install dependencies' para instalar las dependencias necesarias. Después de esto, se puede seleccionar php7 y compilarlo. Cuando el proceso termine, puedes usar php7 en tu sitio web añadiendo la siguiente línea en el .htaccess
{{<highlight sh>}}
AddHandler application/x-httpd-php7 .php
{{</highlight>}}

Y ya hemos terminado, ahora dispones de un servidor con php7 y msql5.6, lo que te dará un buen empujón en cuanto a rendimiento.
