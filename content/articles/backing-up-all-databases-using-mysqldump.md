+++
article_image = "backing-up-all-databases-using-mysqldump.png"
author = "Jeferson"
date = "2015-08-30T11:05:36+02:00"
description = ""
news_keywords = []
pinned = "notpinned"
project = ""
resources = []
series = []
tags = ["mysqldump", "bash"]
title = "Backing up all databases using mysqldump"

+++
In this post I'll explain how I backup all databases in servers I work with. When you face trouble with those servers it'll be pretty useful to have daily database dumps.
So, I use mysqldump utiliy to backup database and an script I wrote myself to transfer files, which you can find here
Backing up all databases with mysqldumpo is pretty easy, just use it in this way in bash:
{{<highlight sh>}}
mysqldump -uadmin -p`cat /etc/psa/.psa.shadow` --all-databases | zip > $1/all.sql.zip
{{</highlight>}}

You can change the -p parameter to use another password. I use that file as plesk stores its password there, but you can change it. The last part is also very important, you should always zip the .sql file as you can save up to 90% disk space. For example, some databases backups are 250Mb when zipped, but when you extract the .sql file you will face a ~2.5 Gb text file.
With the following script you can backup your database and transfer it to your FTP server, storing it into /aaa.bbb.ccc.ddd/ directory, or wherever you want.
{{<highlight bash>}}
#!/bin/sh

tempDir=$1

date=$(date +%y%m%d-%H%M)
mysqldump -uadmin -p`cat /etc/psa/.psa.shadow` --all-databases | zip > $tempDir/all.sql.zip

/script/ftpConnect.sh $tempDir/all.sql.zip /aaa.bbb.ccc.ddd/_bbdd/$date.sql.zip
{{</highlight>}}
As I said, your .sql files will be huge, so you'll need a way to split it into different .sql, each one containing an individual database. We'll use a bash script for this task too:
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

Ok, with this script we're unzipping the mysqldump file and splitting it into different files using the separator `Current Database`, the {*} part is just telling csplit to split the file in as many parts as needed because by default it'll split it in two files. The next part renames the output files to make it easy to find an individual database.

Sometimes I find trouble when using this script, because (I don't really know why) mysqldump writes twice the Current Database part for the same db, so you can find that mv command overwrites a database.

Also, you need to review the outfile000 since it'll containg some headers which should be included in each database before importing them. You can do this with bash too, I just haven't done it yet.
