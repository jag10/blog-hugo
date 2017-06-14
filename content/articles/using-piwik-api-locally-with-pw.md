---
article_image : "using-piwik-api-locally-with-pw.jpg"
author : "Jeferson"
date : "2016-05-01T12:37:41+02:00"
news_keywords : ["processwire", "piwik"]
pinned : "notpinned"
project : ""
resources : []
series : []
tags : ["processwire", "piwik"]
title : "Using piwik's API locally with ProcessWire"

---
To track jglab.me visits I use Piwik. Why? The main reason is because it allows to keep info private, moreover, Piwik offers a powerful API which can be queried locally, and that is important for performance as we can obtain stats about the website without having to query external server. To make local queries I use the following class:
## Show me the code
{{<highlight php>}}
<?php
use Piwik\API\Request;
use Piwik\FrontController;

define('PIWIK_INCLUDE_PATH', $_SERVER['DOCUMENT_ROOT'] . "/piwik/");
define('PIWIK_USER_PATH', $_SERVER['DOCUMENT_ROOT'] . "/piwik/");
define('PIWIK_ENABLE_DISPATCH', false);
define('PIWIK_ENABLE_ERROR_HANDLER', true);
define('PIWIK_ENABLE_SESSION_START', false);

// if you prefer not to include 'index.php', you must also define here PIWIK_DOCUMENT_ROOT
// and include "libs/upgradephp/upgrade.php" and "core/Loader.php"
require_once PIWIK_INCLUDE_PATH . "/index.php";
require_once PIWIK_INCLUDE_PATH . "/core/API/Request.php";
$environment = new \Piwik\Application\Environment(null);
$environment->init();
FrontController::getInstance()->init();
class localPiwik{
   private function getPageUrl($url){
     // This inits the API Request with the specified parameters
    $request = new Request("
                module=API
              	&method=Actions.getPageUrl
              	&idSite=1
              	&date=today
              	&pageUrl=$url
              	&period=year
              	&format=original
              	&token_auth=your.api.key
                ");
    // Calls the API and fetch data back
    $result = $request->process();
    return $result;
  }

  public function getUniqueVisits($url){
    $result = $this->getPageUrl($url);
    if($result->getRowFromLabel('/index'))
     return $result->getRowFromLabel('/index')->getColumn('sum_daily_nb_uniq_visitors');
    else return 0;
  }
}
?>
{{</highlight>}}

We can use that class in the following way:
{{<highlight php>}}
<?php
include_once('localPiwik.php');
$piwik = new localPiwik();
$visits = $piwik->getUniqueVisits('http://example.org');
{{</highlight>}}

## The example
To sum up, I'll show you an example of how to get an ordered list of the most visited posts on a ProcessWire website.
{{<highlight php>}}
<?php
function top_posts($posts_PW){
    include_once('localPiwik.php');
    $piwik = new localPiwik();
    $posts = array();
    foreach ($posts_PW as $post){
      $visits = $piwik->getUniqueVisits($post->httpUrl);
      if(!is_null($visits)){
        $posts[$post->url] = $visits;
      }
      else{
        $posts[$post->url] = 0;
      }
    }
    asort($posts);
    $posts = array_reverse($posts);
    return array_slice($posts, 0 , 5);
  }
?>
{{</highlight>}}
