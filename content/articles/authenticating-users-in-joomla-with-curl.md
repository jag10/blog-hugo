---
article_image: "authenticating-users-in-joomla-with-curl.jpg"
author: "Jeferson"
date: "2016-01-16T11:07:16+02:00"
news_keywords: ["curl"]
pinned: "notpinned"
project: ""
resources:
  - "Basic cURL example": "http://php.net/manual/en/curl.examples-basic.php"
series: []
tags: ["curl"]
title: "Authenticating users with cURL"
---

In this post I'll explain how to log in a user with cURL. This can be useful if you want to integrate joomla login with an external app. For example, you could have a dual installation of wordpress and joomla and use wordpress joomla to log in joomla users as well.
<!--more-->

Joomla outputs two values for each login form and those values have to be valid. So, in first place we need to get those values with cURL. Also, joomla stores a cookie when we visit the website. We need to save it and pass it to the user's browser. Then, with this data we send a POST request with cURL to log the user in. Then, joomla returns another cookie. We have to send this cookie as well to the user's navigation. After this, the user is logged into the joomla app.

What we did here is logging the user in the way he'd do if he was doing a manual login. This idea is valid for another apps (wordpress, prestashop, etc...) You just need to know how the authentication process work. Then, you'll be able to replicate it with some php code.
{{<highlight php>}}
<?php
/*
	Valid for Joomla 2.5
  Firstly, we need a valid token from the login form. Also, we'll need to save the cookies that cURL will find and then send them to the user browser.
  Then, with those tokens and cookies, we can force the login in the joomla app. Finally, a successful login returns another cookie. That cookie
  must be sent to the user as well. After this, the user is successfully logged.
*/

$uname = 'test@jglab.me';
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

// Get data from the form
preg_match_all("(&lt;input type=\"hidden\" name=\"return\" value=\"(.*)\" /&gt;)siU", $page, $matches1);
preg_match_all("(&lt;input type=\"hidden\" name=\"(.*)\" value=\"1\" /&gt;)iU", $page, $matches2);
$return = trim($matches1[1][0]);
$key = trim($matches2[1][0]);

// Send data to the POST request
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

// Catch cookie and send it to user's browser
preg_match('/^Set-Cookie: (.*?);/m', $ret, $m);
$cookie=explode('=',$m[1]);
setcookie($cookie[0], $cookie[1], time() + 86400 * 30 , "/");
curl_close($ch);
?>
{{</highlight>}}
