---
article_image : "configuring-a-lamp-server-on-centos-6.jpg"
author : "Jeferson"
date : "2015-08-09T10:48:45+02:00"
news_keywords : ["httpd", "mysql", "php", "centos6"]
pinned : "notpinned"
project : ""
resources:
  - "LAMP server on linux.com": "https://www.linux.com/learn/easy-lamp-server-installation"
series : []
tags : ["httpd", "mysql", "php", "centos6"]
title : "configuring a LAMP server on CentOS 6"

---

En este post voy a explicar cómo configurar un servidor VPS para tener un servidor LAMP básico con múltiples versiones PHP, compiladas previamente. De esta manera, podemos tener un servidor VPS muy barato (~3€) en el que hacer probaturas.

## Estructura de directorios
En primer lugar, vamos a crear la estructura de directorios. Utilizaré jag.co como dominio para este ejemplo. Puedes utilizar la estructura de directoriosque quieras, esta es la mía:
<!--more-->

{{<highlight cirru>}}
/
/var/www/vhosts/jag.co
/var/www/vhosts/jag.co/logs
/var/www/vhosts/jag.co/httpdocs
{{</highlight>}}

También necesitaremos un usuario del sistema para que ejecute php, aunque en principio php será ejecutado por apache, para comprobar nuestra confguración. Puedes crear la estructura de directorios y el usuario con los siguientes comandos:
{{<highlight sh>}}
mkdir -p /var/www/vhosts/jag.co
useradd -d /var/www/vhosts/jag.co/ jag
usermod -g apache jag
chmod 710 /var/www/vhosts/jag.co
{{</highlight>}}

Ahora añadiremos un repositorio importante al sistema. Lo necesitamos para seguir, y lo necesitarás más adelante. Después de eso, estaremos en posición de instalar httpd con php.
{{<highlight sh>}}

yum install epel-release
yum install httpd
yum install mod_fcgid
yum install php
{{</highlight>}}

Deberías poder ver la página por defecto de apache, visitando tu VPS con tu navegador preferido. Pero eso es demasiado incómodo, así que vamos a mejorarlo. Vamos a configurar un host virtual, jag.co. Primero, hay que activar los hosts virtuales. Para ello, vamos a editar la configuración de httpd (``/etc/httpd/conf/httpd.conf``), añadiendo la siguiente línea:
{{<highlight sh>}}
NameVirtualHost *:80
{{</highlight>}}

Después, vamos a crear y editar el fichero ``/etc/httpd/conf.d/jag.co.conf`` para incluir el siguiente contenido:

{{<highlight apache>}}
LoadModule suexec_module    lib/apache/mod_suexec.so
&lt;VirtualHost *:80&gt;
    ServerName jag.co
    DocumentRoot /var/www/vhosts/jag.co/httpdocs
    ServerAdmin hostmaster@jag.co

    ErrorLog /var/www/vhosts/jag.co/logs/error.log
    CustomLog /var/www/vhosts/jag.co/logs/access.log combined

    SuexecUserGroup jag jag
    ScriptAlias /cgi-bin/ "/var/www/vhosts/jag.co/.cgi-bin/"

    &lt;Directory "/var/www/vhosts/jag.co/.cgi-bin/"&gt;
        AllowOverride None
        Order allow,deny
        Allow from all
    &lt;/Directory&gt;

    &lt;Directory "/var/www/vhosts/jag.co/httpdocs"&gt;
        Options Indexes Includes FollowSymLinks
        AllowOverride All
        #mod_php executes all php by default, so we need to use the Filesmatch directive to tell apache we want to execute php with our own cgi-bin.
        &lt;FilesMatch ".+\.ph(p[345]?|t|tml)$"&gt;
            SetHandler php5-fastcgi
            Action php5-fastcgi /cgi-bin/php.fcgi
        &lt;/FilesMatch&gt;
        Order allow,deny
        Allow from all
    &lt;/Directory&gt;
	#allow 20M request, just to manage files
    FcgidMaxRequestLen 20000000

&lt;/VirtualHost&gt;
{{</highlight>}}

Aquí le estamos dando a apache algunas directivas básicas para nuestro virtualhost, como los logs de errores (recuerda crear los ficheros y establecer sus permisos) o cómo ejecutar php. Para ejecutar php estamos usando suexec_mod, que nos permite ejecutar php bajo diferentes usuarios, mejorando la seguridad entre virtualhosts. Por defecto, mod_php ejecutaría los ficheros php bajo el usuario apache. Si no queremos que eso ocurre, utilizaremos la directiva
SetHandler. Así, le decimos a apache que ejecute php con un script que crearemos más tarde.

Ahora necesitamos crear los logs:
{{<highlight apache>}}

mkdir -p /var/www/vhosts/jag.co/logs/
touch /var/www/vhosts/jag.co/logs/error.log
touch /var/www/vhosts/jag.co/logs/access.log
{{</highlight>}}

En el siguiente paso vamos a crear el script mencionado anteriormente, estableciendo algunas variables de entorno y ejecutando php. Crea y edita el siguiente fichero: ``/var/www/vhosts/jag.co/.cgi-bin/php.fcgi``
{{<highlight bash>}}

#!/bin/bash
#
# php5.fcgi
# Shell Script to run PHP5 using mod_fastcgi under Apache 2.x
USER="jag"
PHPRC="/var/www/vhosts/jag.co/.cgi-bin/php.ini"
PHP_FCGI_CHILDREN=5
export PHP_FCGI_CHILDREN
exec /usr/bin/php-cgi
{{</highlight>}}

En este script estamos ejecutando la misma versión de php que mod_php utilizaría, pero más tarde veremos como cambiar esto. De momento podemos establecer un php.ini personalizado para este virtualhost.

{{<highlight sh>}}
cp -fv /etc/php/cgi/php.ini /var/www/vhosts/jag.co/.cgi-bin/
chown -R jag:apache /var/www/vhosts/jag.co/
chown -R jag:jag .cgi-bin
{{</highlight>}}

Además, deberías añadir la directiva ``open_basedir``, de forma que los usuarios no puedan tocar los ficheros de otros usuarios. También hay que añadir el directorio /tmp a esta directiva para poder subir ficheros a través del navegador.
{{<highlight sh>}}
open_basedir = /var/www/vhosts/jag.co/httpdocs/:/tmp
{{</highlight>}}

## Instalando versiones adicionales de php
Tarde o temprano necesitarás versiones de php extra. En este caso voy a elegir la versión 5.6.10 y a trabajar desde el directorio /script
{{<highlight sh>}}
mkdir /script
cd /script
wget http://us1.php.net/get/php-5.6.10.tar.gz/from/this/mirror
tar -zxvf mirror
yum install libxml2-devel libXpm-devel gmp-devel libicu-devel t1lib-devel aspell-devel openssl-devel bzip2-devel libcurl-devel libjpeg-devel libvpx-devel libpng-devel freetype-devel readline-devel libtidy-devel libxslt-devel libmcrypt-devel pcre-devel curl-devel mysql-devel ncurses-devel gettext-devel net-snmp-devel libevent-devel libtool-ltdl-devel libc-client-devel postgresql-devel
yum groupinstall 'Development Tools'
{{</highlight>}}

{{<highlight sh>}}
./configure --prefix=/usr/bin/php56 --with-config-file-path=/etc/php56 --with-config-file-scan-dir=/etc/php56/php.d --with-libdir=lib64 --with-mysql --with-mysqli --enable-mbstring --disable-debug --disable-rpath --with-bz2 --with-curl --with-gettext --with-iconv --with-openssl --with-gd --with-mcrypt --with-pcre-regex --with-zlib --enable-cgi --enable-pdo=shared --with-pdo-mysql=shared --with-pdo-sqlite=shared --enable-zip --with-jpeg-dir=/usr/lib64 --with-freetype-dir=/usr/ --enable-gd-native-ttf

make
make test
make install
{{</highlight>}}

Copia tu nuevo php.ini
{{<highlight sh>}}

cp php.ini-production /etc/php56/php.ini
vim /etc/php56/php.ini
#add this
cgi.fix_pathinfo = 1
{{</highlight>}}

Recuerdas el script que escribimos antes? Ahora podemos usar ese script para ejecutar la versión de php que queramos
{{<highlight sh>}}
exec /usr/bin/php56/bin/php-cgi
{{</highlight>}}

Esta operación se puede repetir múltiples veces, teniendo diferentes versiones de php

## Solución de problemas
Si tienes problemas, recomiendo comprobar los logs, especialmente apache y suexec.

## Instalando mysql y phpmyadmin
Instalar mysql y phpmyadmin es sencillo, simplemente ejecuta los siguientes comandos y sigue las intrucciones:
{{<highlight sh>}}

yum install mysql-server
service mysqld start
mysql_secure_installation
{{</highlight>}}

Para limitar el acceso a phpmyadmin, edita el fichero ``/etc/httpd/conf.d/phpMyAdmin.conf``. Recuerda cambiar x.x.x.x por tu IP.
{{<highlight apache>}}

# phpMyAdmin - Web based MySQL browser written in php
#
# Allows only localhost by default
#
# But allowing phpMyAdmin to anyone other than localhost should be considered
# dangerous unless properly secured by SSL

Alias /phpMyAdmin /usr/share/phpMyAdmin
Alias /phpmyadmin /usr/share/phpMyAdmin

&lt;Directory /usr/share/phpMyAdmin/&gt;
   AddDefaultCharset UTF-8

   &lt;IfModule mod_authz_core.c&gt;
     # Apache 2.4
     &lt;RequireAny&gt;
       Require ip 127.0.0.1
       Require ip ::1
       Require x.x.x.x
     &lt;/RequireAny&gt;
   &lt;/IfModule&gt;
   &lt;IfModule !mod_authz_core.c&gt;
     # Apache 2.2
     Order Deny,Allow
     Deny from All
     Allow from 127.0.0.1
     Allow from ::1
     Allow from x.x.x.x
   &lt;/IfModule&gt;
&lt;/Directory&gt;

&lt;Directory /usr/share/phpMyAdmin/setup/&gt;
   &lt;IfModule mod_authz_core.c&gt;
     # Apache 2.4
     &lt;RequireAny&gt;
       Require ip 127.0.0.1
       Require ip ::1
       Require x.x.x.x
     &lt;/RequireAny&gt;
   &lt;/IfModule&gt;
   &lt;IfModule !mod_authz_core.c&gt;
     # Apache 2.2
     Order Deny,Allow
     Deny from All
     Allow from 127.0.0.1
     Allow from ::1
     Allow from x.x.x.x
   &lt;/IfModule&gt;
&lt;/Directory&gt;

# These directories do not require access over HTTP - taken from the original
# phpMyAdmin upstream tarball
#
&lt;Directory /usr/share/phpMyAdmin/libraries/&gt;
    Order Deny,Allow
    Deny from All
    Allow from None
&lt;/Directory&gt;

&lt;Directory /usr/share/phpMyAdmin/setup/lib/&gt;
    Order Deny,Allow
    Deny from All
    Allow from None
&lt;/Directory&gt;

&lt;Directory /usr/share/phpMyAdmin/setup/frames/&gt;
    Order Deny,Allow
    Deny from All
    Allow from None
&lt;/Directory&gt;

# This configuration prevents mod_security at phpMyAdmin directories from
# filtering SQL etc.  This may break your mod_security implementation.
#
#&lt;IfModule mod_security.c&gt;
#    &lt;Directory /usr/share/phpMyAdmin/&gt;
#        SecRuleInheritance Off
#    &lt;/Directory&gt;
#&lt;/IfModule&gt;
{{</highlight>}}

Finalmente, hay que configurar apache y mysql para que se inicien con el sistema:
{{<highlight sh>}}
chkconfig httpd on
chkconfig mysqld on
{{</highlight>}}
