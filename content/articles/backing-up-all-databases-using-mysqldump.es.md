---
article_image : "backing-up-all-databases-using-mysqldump.png"
author : "Jeferson"
date : "2015-08-30T11:05:36+02:00"
news_keywords : ["mysqldump", "bash"]
pinned : "notpinned"
project : ""
resources:
  - "mysqldump en dev.mysql.com": "https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html"
series : []
tags : ["mysqldump", "bash"]
title : "Haciendo un backup de todas las BD usando mysqldump"

---
En este post vamos a ver como hacer un backup de todas las bases de datos, tomando como ejemplo uno de los servidores con los que actualmente trabajo. Así, si surge algún problema con el servidor podremos disponer de un backup reciente.

Para ello, utilizo la utilidad mysqldump y un script para transferir los ficheros a un servidor ftp.
<!--more-->

Hacer el backup de las bases de datos con mysqldump es muy fácil:
{{<highlight sh>}}
mysqldump -uadmin -p`cat /etc/psa/.psa.shadow` --all-databases | zip > $1/all.sql.zip
{{</highlight>}}

El parámetro -p indica la password para el usuario admin. Yo utilizo ese fichero porque plesk almacena su contraseña ahí, pero se puede cambiar. La última parte es muy importante, siempre debe comprimirse el fichero .sql porque puede ahorrarse hasta un 90% de espacio. Por ejemplo, algunos backups ocupan 250mb comprimidos, pero cuando lo extraes el fichero .sql puede ser de alrededor de 2.5Gb
Con el siguiente script se puede hacer un backup de las bases de datos y transferirlo a un servidor ftp, almacenandolo en el directorio /aaa.bbb.ccc.ddd/, o donde quieras
{{<highlight bash>}}
#!/bin/sh

tempDir=$1

date=$(date +%y%m%d-%H%M)
mysqldump -uadmin -p`cat /etc/psa/.psa.shadow` --all-databases | zip > $tempDir/all.sql.zip

/script/ftpConnect.sh $tempDir/all.sql.zip /aaa.bbb.ccc.ddd/_bbdd/$date.sql.zip
{{</highlight>}}
Para descomprimir los ficheros se puede usar el siguiente script.
{{<highlight bash>}}
#!/bin/sh
file=$1

unzip -p $file | cat > ALL_DATABASES.sql

csplit --digits=3 --quiet --prefix=outfile ALL_DATABASES.sql '/Current Database/' '{*}'

files='outfile.*'
regex='Current Database: `(.*)`'

for i in $(ls | grep 'outfile')
do
	name=$(head $i | egrep -o "$regex" | awk -F '`' '{print $2}')
	echo "$i: $name"
    if [ ! -f $name ]; then
	    mv $i $name
    else
        number=$RANDOM
        let "number %= 10"
        mv $i $name$number
    fi
done
{{</highlight>}}

Ok, con este script se descomprimen las bases de datos y se separan en diferentes ficheros, utilizando el separador ``Current Database`, el {*} le indica a csplit que divida el fichero en tantas partes como sea necesario, dado que por defecto lo divide en solo dos partes, La siguiente parte renombra los ficheros para que sea sencillo identificarlos

Además, hay que revisar el fichero outfile000, dado que contiene algunas cabeceras que deberían ser incluidas en cada fichero de base de datos. Esto se puede hacer con bash también.
