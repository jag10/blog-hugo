---
article_image : "zipping-and-unzipping-websites-with-php.png"
author : "Jeferson"
date : "2015-08-24T11:00:53+02:00"
news_keywords : ["php", "backup", "zip"]
pinned : "notpinned"
project : ""
resources:
  - "Backup mysql db": "http://davidwalsh.name/backup-mysql-database-php"
  - "1and1 help center": "https://help.1and1.com/hosting-c37630/scripts-and-programming-languages-c85099/php-c37728/importing-and-exporting-mysql-databases-using-php-a595887.html"
series : []
tags : ["php", "backup", "zip"]
title : "Zipping and unzipping websites with php"

---
Sometimes you need to work with only FTP access, and it takes a lot of time to backup a website through FTP because usually there are a lot of files and listing them is a long process. I made these php scripts to avoid wasting time when I only have FTP access. For example, when a mate wants to work on a website but he/she want to backup it up first just in case they break something. They use these scripts below:
{{<highlight php>}}
<?php
$zip = new ZipArchive();

if (!$zip-&gt;open("data1.zip", ZIPARCHIVE::CREATE)) {
	die ("&lt;p class='error'&gt;Couldn't create the file&lt;/p&gt;");
}

$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("."));

$path_parts = pathinfo(__FILE__);
$script_path = $path_parts['dirname'] . '/'. $path_parts['basename'];
foreach ($iterator as $key=&gt;$value) {
	if(is_file($key) &amp;&amp; realpath($key) != $script_path){ // don't include this file
		$zip-&gt;addFile($key, $key) or die ("&lt;p class='error'&gt;ERROR: Couldn't add file: $key&lt;/p&gt;");
		echo $key . '&lt;br&gt;';
	}
}

$zip-&gt;close() or die ("&lt;p class='error'&gt;ERROR: Couldn't save the file&lt;/p&gt;");

echo "&lt;h1&gt;OK.&lt;/h1&gt;";
?>
{{</highlight>}}

{{<highlight html>}}
<style>
	h1{
		position: absolute;
		top: 0;
		right: 100px;
		font-size: 100px;
		color: #148BA5;
	}

	.error{
		color: red;
	}
</style>
{{</highlight>}}


This script will take all the content in the current directory, iterate directories recursively and create a file named "data1.zip". There you have it. It's is important to make sure all files are included, you don't want to trust in your backups just to find later that they aren't 100% correct. Let's check it. How could we do that? We're going to use our beloved terminal for this task. We'll compare the number of files in both zip.file and the directory we zipped.
Look at this:
{{<highlight sh>}}
$zipinfo /var/www/vhosts/jglab.me/httpdocs/data1.zip | grep files
10132 files, 129117030 bytes uncompressed, 50698507 bytes compressed:  60.7%
$find /var/www/vhosts/jglab.me/httpdocs/ -type f | wc -l
10134
{{</highlight>}}

Our zip contains 10132 files, and find command says there are 10124 in our directory, which makes sense: there were 10132 files before we started, then we added the script zip.php (which doesn't zip itself) and it output data1.zip file, adding up to 10134 files.
Sometimes we also need to unzip files with FTP access. The next script will take care of that:
{{<highlight php>}}
<?php
$file = 'data.zip';

$path = pathinfo(realpath($file), PATHINFO_DIRNAME);

//$path .= '/subdir';

if(!file_exists($path)){
	mkdir($path, 0755, true);
}

$zip = new ZipArchive;
$res = $zip-&gt;open($file);
if ($res === TRUE) {
  // extract it to the path we determined above
  $zip-&gt;extractTo($path);
  $zip-&gt;close();
  echo "$file extracted to $path";
} else {
  echo "Couldn't open $file";
}
?>
{{</highlight>}}

The script takes the file "data.zip" in the current dir and extract its contents to the current dir. You can specify a subdir uncommenting the line $path .= '/subdir';
You should delete these scripts as soon as you use them, they could break your website if someone discovers them.
## BONUS
If you surf the internet you'll find php scripts to backup databases as well. You can find some links in Resources.
