+++
article_image = "installing-magento2-on-cwp.jpg"
author = "Jeferson"
date = "2016-03-24T12:34:39+02:00"
description = ""
news_keywords = []
pinned = "notpinned"
project = ""
resources = []
series = []
tags = ["magento2", "cwp", "php7"]
title = "Instalando magento2 en cwp"

+++
## Empezando
En este post explicaré cómo instalar magento2 sobre Centos Web Panel, utilizando php7 y mysql 5.6. Para empezar, tenemos que compilar php con las extensiones que magento2 necesita. Con el siguiente comando podremos configurar php7 para luego compilarlo y conseguir que funcione con magento2:./configure
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
Es posible cambiar las rutas, pero es aconsejable que instales al menos estas extensiones, pues son necesarias para magento2 y muchos otros CMS

## Instalando magento2

El siguiente paso es descargar e instalar magento2, será muy fácil si el servidor cumple los requisitos (principalmente las extensiones de php y mysql 5.6+).
https://www.magentocommerce.com/download

Cuando instalamos magento2, éste empezará a quejarse de los permisos. Magento2, por defecto, necesita que los directorios tengan permisos 0700, el problema es que esto no funcionará en la mayoría de hostings (si usan plesk, cPanel, etc.) Así que tenemos que cambiar todos los permisos de las carpetas y ficheros con el siguiente comando:
{{<highlight sh>}}
find /path/to/magento -type f -exec chmod 644 {} \;
find path/to/magento -type d -exec chmod 755 {} \;
{{</highlight>}}

Luego, hay que indicarle a magento2 que cree los nuevos ficheros y directorios con estos permisos. Podemos hacerlo en el siguiente fichero:
`/vendor/magento/framework/Filesystem/DriverInterface.php`
{{<highlight sh>}}

/vendor/magento/framework/Filesystem/DriverInterface.php
(WRITEABLE_DIRECTORY_MODE and WRITEABLE_FILE_MODE)

/lib/internal/Cm/Cache/Backend/File.php
(directory_mode and file_mode)
{{</highlight>}}

Y ya lo tienes, magento2 con php7 y mysql 5.6, tendrás un rendimiento bastante notable si trabajas en una máquina con varios núcleos, pues mysql5.6 hará un muy buen uso de ellos, algo que no ocurría en mysql 5.1. En mi servidor básico de OVH, la web tiene tiempos de carga (según gtmetrix) de alrededor de 3 segundos, lo que no está nada mal.
