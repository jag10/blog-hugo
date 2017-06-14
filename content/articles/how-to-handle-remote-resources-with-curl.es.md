---
article_image : "how-to-handle-remote-resources-with-curl.png"
author : "Jeferson"
date : "2016-07-17T13:34:28+02:00"
news_keywords : ["curl", "php", "fopen"]
pinned : "notpinned"
project : ""
resources : []
series : []
tags : ["curl", "php", "fopen"]
title : "Cómo manejar recursos remotos con curl"

---
## El problema
Cuando necesitas obtener ficheros remotos para manejar su contenido (ejemplo: ficheros csv) es posible que su acceso no sea tan sencillo como utilizar fopen:
{{<highlight php>}}
<?php
$handle = fopen($filename, "r") or die('could not open .' $filename);
{{</highlight>}}

Si esta sentencia funciona de forma correcta, luego podremos utilizar el handle para procesar el fichero con distintas utilidades, como fgetcsv(). Es importante poder abrir ficheros con fopen porque muchas funciones utilizan un parámetro del tipo Resource en php, que es lo que nos devuelve fopen.
Sin embargo, fopen puede fallar:

* Si la directiva "allow_url_fopen" está desactivada en la configuración php, no será posible abrir ficheros remotos.
* Si la URL del feed hace alguna redirección, fopen NO seguirá dicha redirección y se obtendrá un error por timeout bastante molesto

## La solución
En este caso, lo recomendable es utilizar cURL, donde se puede indicar a la petición que siga redirecciones y además será posible saltarse las restricciones de allow_url_fopen. Para convertir el fichero remoto en un resource local vamos a utilizar flujos de E/S de php mediante php://temp. Este flujo permite crear un fichero temporal en memoria sin tener que escribirlo en disco y lidiar con los posible problemas en cuanto a la ruta al fichero. Así, con la siguiente función podremos obtener un fichero remoto y manejarlo como si fuera un fichero local:
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

Esta función toma como parámetro una url y nos devuelve un handle de un recurso local que podemos utilizar para manejar el fichero como queramos.
