+++
article_image = "how-to-handle-remote-resources-with-curl.png"
author = "Jeferson"
date = "2016-07-17T13:34:28+02:00"
description = ""
news_keywords = []
pinned = "notpinned"
project = ""
resources = []
series = []
tags = ["curl", "php", "fopen"]
title = "How to handle remote resources with curl"

+++
## The problem
When you need to get remote files to handle its content (i.e. csv files) you may find out that accesing them isn't as easy as using fopen:
{{<highlight php>}}
<?php
$handle = fopen($filename, "r") or die('could not open .' $filename);
{{</highlight>}}

If this sentence works, we could then use the handle to parse the file with different php functions like fgetcsv(). Usually, a lot of functions use a Resource param to handle files, so it's important to know how to get a handle from a file. Fopen gives us this functionality, but it can fail in some scenarios:

* If the "allow_url_fopen" is disabled in php settings, we won't be able to open remote files
* If the url we are using makes any redirection, fopen WILL NOT follow that redirección and we'll get a timeout error.

## The solution
In this case, we should use cURL, so we can follow redirections and get over the "allow_url_fopen" directive. In order to get a resource from a remote url we're going to use php streams. php://temp stream allows us to create a temporal file in memory so we don't need to write in disk, which is slow and forces us to handle the path to the file. So, with the following function we'll be able to get a handle from a remote url and use it as if it was a local file on our disk:

{{<highlight php>}}
<?php
function _curl($url){
 try {
  $file_handler = fopen('php://temp', 'w+');
  $ch = curl_init();
  if (FALSE === $ch)
   throw new Exception('failed to initialize');
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt($ch, CURLOPT_FILE, $file_handler);
  //curl_setopt ($ch, CURLOPT_PORT , 8080);
  curl_setopt($ch, CURLOPT_TIMEOUT, 10); //timeout in seconds
  $content = curl_exec($ch);
  curl_close($ch);
  if (FALSE === $content)
   throw new Exception(curl_error($ch), curl_errno($ch));
  rewind($file_handler);
  return $file_handler;
 } catch(Exception $e) {
  trigger_error(sprintf(
   'Curl failed with error #%d: %s',
  $e->getCode(), $e->getMessage()),
   E_USER_ERROR);
 }
}
{{</highlight>}}

This function takes a url as a parameter and it returns a handle to a local resource, which we can use to treat the file as we want
