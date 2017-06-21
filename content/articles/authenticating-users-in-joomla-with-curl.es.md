---
article_image: "authenticating-users-in-joomla-with-curl.jpg"
author: "Jeferson"
date: "2016-01-16T11:07:16+02:00"
news_keywords: ["curl"]
pinned: "notpinned"
project: ""
resources:
  - "Ejemplo básico de cURL": "http://php.net/manual/en/curl.examples-basic.php"
series: []
tags: ["curl"]
title: "Autenticando usuarios con cURL"
---

En est post vamos a ver como autenticar un usuario utilizando cURL. Esto puede ser útil si se quiere integrar un login con una aplicación externa y no se dispone de una API. Por ejemplo, se podrían tener dos plataformas que gestionen los usuarios de manera diferente pero en las que el login sea único.
<!--more-->

En el caso concreto de Joomla, se utilizan dos valores generados, y éstos tienen que ser válidos. Así que, en primer lugar hay que obtener esos valores con cURL. Además, Joomla almacena una cookie cuando se visita el sitio. Hay que guardar esa cookie y pasársela al navegador del usuario. Luego, se enviarán estos datos mediante una petición POST. Entonces Joomla devolverá otra cookie, que también tendremos que enviar al navegador del usuario. Después de ese último paso, el usuario queda logueado en la aplicación.

Lo que hemos hecho es autenticar al usuario de la manera que lo haría él manualmente. Esta idea es válida para cualquier otra aplicación. Lo único que hay que hacer es conocer el proceso de autenticación para replicarlo luego.
{{<highlight php>}}
<?php
/*
  Válido para Joomla 2.5
	En primer lugar, se necesita un token válido para el formulario. Además, también hay que guardar las cookies que obtendrá la petición cURL y reenviarlas al navegador.
  Después, con esos tokens y cookies, se puede hacer el login en la aplicación. Finalmente, un login satisfactorio devuelve otra cookie. Esa cookie
  también hay que enviarla al usuario. Después de esto, el usuario queda autenticado.
*/

$uname = 'test@jarboleda.me';
$upswd = 'passwd';
$url = "http://www.example.com";
$cookie_jar = tempnam('tmp','cookie');
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url );
curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE );
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE );
curl_setopt($ch, CURLOPT_COOKIESESSION, TRUE );
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_jar);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_jar);
curl_setopt($ch, CURLOPT_HEADER, TRUE );
$page = curl_exec($ch);

// Catch the cookie and send it to user's browser
preg_match('/^Set-Cookie: (.*?);/m', $page, $m);
$cookie=explode('=',$m[1]);
setcookie($cookie[0], $cookie[1], time() + 86400 * 30 , "/");

// Obtener datos del formulario
preg_match_all("(&lt;input type=\"hidden\" name=\"return\" value=\"(.*)\" /&gt;)siU", $page, $matches1);
preg_match_all("(&lt;input type=\"hidden\" name=\"(.*)\" value=\"1\" /&gt;)iU", $page, $matches2);
$return = trim($matches1[1][0]);
$key = trim($matches2[1][0]);

// Enviar datos con cURL
$postfields = array();
$postfields['username'] = $uname;
$postfields['password'] = $upswd;
$postfields['option'] = 'com_users';
$postfields['task'] = 'user.login';
$postfields['remember'] = "yes";
$postfields['return'] = $return;
$postfields[$key] = '1';

curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
$ret = curl_exec($ch);

// Obtener la cookie y mandarla al navegador
preg_match('/^Set-Cookie: (.*?);/m', $ret, $m);
$cookie=explode('=',$m[1]);
setcookie($cookie[0], $cookie[1], time() + 86400 * 30 , "/");
curl_close($ch);
?>
{{</highlight>}}
