+++
article_image = "configuring-a-lamp-server-on-centos-6.jpg"
author = "Jeferson"
date = "2015-08-09T10:48:45+02:00"
description = ""
news_keywords = []
pinned = "notpinned"
project = ""
resources = []
series = []
tags = ["httpd", "mysql", "php", "centos6"]
title = "configuring a LAMP server on CentOS 6"

+++

In this first post I'll explain how I configurated my VPS to run a basic LAMP server with multiple php versions, compiled by myself. You can get your own cheap VPS (~3€) and test a lot of things.
Firstly, we'll create our dir structure. I'll use jag.co as a domain for this example, you can choose the dir structure you want, but I recommend following this one:
{{<highlight cirru>}}
/
/var/www/vhosts/jag.co
/var/www/vhosts/jag.co/logs
/var/www/vhosts/jag.co/httpdocs
{{</highlight>}}

We'll also create a system user who will be running php, although at first we'll run php under apache, just to test our configuration. You can create this dir structure and the system user with the following commands:
{{<highlight sh>}}
mkdir -p /var/www/vhosts/jag.co
useradd -d /var/www/vhosts/jag.co/ jag
usermod -g apache jag
chmod 710 /var/www/vhosts/jag.co
{{</highlight>}}

Now we'll add an important repository to our system. We'll need it here and you'll need it later, for sure. After that, we are good to perform a basic httpd install, along with php.
{{<highlight sh>}}

yum install epel-release
yum install httpd
yum install mod_fcgid
yum install php
{{</highlight>}}

You should be able to test the default page of apache, visiting your vps ip through your preferred browser. But that's too uncomfortable, so we'll improve it. We are going to configure a virtual host, named jag.co. First, we need to activate virtual hosts. To do that, we're going to edit the main httpd configuration file (/etc/httpd/conf/httpd.conf) and add/uncomment the following line:
{{<highlight sh>}}
NameVirtualHost *:80
{{</highlight>}}

Secondly, we're going to create and edit the file /etc/httpd/conf.d/jag.co.conf and include the following content:

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


Here we're telling apache some basic directives to use with our virtualhost, like error logs (remember to create these files and set their permissions correctly) or how to execute php files. To execute php we'll be using suexec_mod, which allow us to execute php under different users, thus improving security between virtual hosts. By default, mod_php will take all our php files and execute them under apache user. So if we don't want that to happen under our virtualhost, we'll use the directive SetHandler to change that. This way, we're telling apache to execute .php files with an script we'll create later.
Now, we need to create log files:
{{<highlight apache>}}

mkdir -p /var/www/vhosts/jag.co/logs/
touch /var/www/vhosts/jag.co/logs/error.log
touch /var/www/vhosts/jag.co/logs/access.log
{{</highlight>}}

In next step we'll create an script which will take care of php files, setting some environment variables and executing php. Create and edit the following file: /var/www/vhosts/jag.co/.cgi-bin/php.fcgi
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

In this script we're executing exactly the same php version mod_php would use, but later we'll change that. Now you can set a customized php.ini for this virtual host. Also, remember to set permissions and ownership.

{{<highlight sh>}}
cp -fv /etc/php/cgi/php.ini /var/www/vhosts/jag.co/.cgi-bin/
chown -R jag:apache /var/www/vhosts/jag.co/
chown -R jag:jag .cgi-bin
{{</highlight>}}

You should add the open_basedir directive to your php.ini, so users can't touch others users' files. Also, add the /tmp dir to this directive, you'll need it if you want to upload files to your website ith your browser.
{{<highlight sh>}}
open_basedir = /var/www/vhosts/jag.co/httpdocs/:/tmp
{{</highlight>}}
Ok, you should be good to go. You can upload some php file and try to get it through your browser and see what happens. I recommend putting some phpinfo() function inside to get details about your php installation. You'll notice it's running under your user and not under apache.

## Installing additional PHP versions
Ok, sooner or later you'll find a client of yours or maybe yourself need an older/newer php version, so let's take care of that before it happens. Firstly, we need to choose an additional php version and download it. I'll choose 5.6.10 and will work from /script directory. You can choose any directory, this won't affect at all.
After downloading it, we'll install some tools we'll need to compile php.
{{<highlight sh>}}
mkdir /script
cd /script
wget http://us1.php.net/get/php-5.6.10.tar.gz/from/this/mirror
tar -zxvf mirror
yum install libxml2-devel libXpm-devel gmp-devel libicu-devel t1lib-devel aspell-devel openssl-devel bzip2-devel libcurl-devel libjpeg-devel libvpx-devel libpng-devel freetype-devel readline-devel libtidy-devel libxslt-devel libmcrypt-devel pcre-devel curl-devel mysql-devel ncurses-devel gettext-devel net-snmp-devel libevent-devel libtool-ltdl-devel libc-client-devel postgresql-devel
yum groupinstall 'Development Tools'
{{</highlight>}}

Ok, time to configure our php install. You should think about what needs you have and find out which libraries you'll need in your php instalation. I've used this one, you should be able to go with it. Also, it's pretty straight forward to change this in future, so don't worry a lot about it. After configuring it, we'll install it. This will be an slow process, so sit and wait patiently.
{{<highlight sh>}}
./configure --prefix=/usr/bin/php56 --with-config-file-path=/etc/php56 --with-config-file-scan-dir=/etc/php56/php.d --with-libdir=lib64 --with-mysql --with-mysqli --enable-mbstring --disable-debug --disable-rpath --with-bz2 --with-curl --with-gettext --with-iconv --with-openssl --with-gd --with-mcrypt --with-pcre-regex --with-zlib --enable-cgi --enable-pdo=shared --with-pdo-mysql=shared --with-pdo-sqlite=shared --enable-zip --with-jpeg-dir=/usr/lib64 --with-freetype-dir=/usr/ --enable-gd-native-ttf

make
make test
make install
{{</highlight>}}

Ok, now you can copy your new php.ini
{{<highlight sh>}}

cp php.ini-production /etc/php56/php.ini
vim /etc/php56/php.ini
#add this
cgi.fix_pathinfo = 1
{{</highlight>}}

Remember the script we wrote to execute php files? Ok, now it's the time to tell that script to execute php files with our new php install. We'll need to change the exec line, like this:
{{<highlight sh>}}
exec /usr/bin/php56/bin/php-cgi
{{</highlight>}}

Now you can repeat this operation as many times as you want, and you'll have different php versions, choosing which one you want to use with each virtual host. Also, you can configure and install php again with other params, overwriting the old configuration with no problems.

## Troubleshooting
If you have trouble, I recommend to check log files, specially apache and suexec log. This last file will tell you if there are some wrong set permissions.

## Installing mysql and phpmyadmin
Installing mysql and phpmyadmin is easy, just type in the following commands and follow the instructions on screen:
{{<highlight sh>}}

yum install mysql-server
service mysqld start
mysql_secure_installation
{{</highlight>}}

You should limit the access to phpmyadmin, so I recommend adding this to /etc/httpd/conf.d/phpMyAdmin.conf. Just change x.x.x.x for your ip. This way, only you can connect to phpmyadmin
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

Finally, you should auto start apache and mysql, just in case you need to reboot your server. Use the following commands to achieve this
{{<highlight sh>}}
chkconfig httpd on
chkconfig mysqld on
{{</highlight>}}
