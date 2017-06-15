---
article_image : "getting-an-objects-methods.jpg"
author : "Jeferson"
date : "2016-05-01T13:28:37+02:00"
news_keywords : ["php", "ReflectionMethod"]
pinned : "notpinned"
project : ""
resources:
  - "get_class_methods on php.net": "http://php.net/manual/en/function.get-class-methods.php"
  - "get_class on php.net": "http://php.net/manual/en/function.get-class.php"
  - "The ReflectionMethod class on php.net": "http://php.net/manual/en/class.reflectionmethod.php"
series : []
tags : ["php", "ReflectionMethod"]
title : "Getting an object's (reflected) methods"

---
## The problem
Sometimes we don't have access to the platform docs on which we are working, it's incomplete or we just don't feel like looking for it. In those situations, we usually need more than the typical object's ``var_dump``, which only shows us the object properties but not its methods, which usually gives us that function we are working on without having to dive into the object's properties. Here you'll see the function I use for this task. This function uses the ReflectionMethod class, which gives us info about a method. It needs the classname and method's name as params for its constructor.

<!--more-->

{{<highlight php>}}
<?php
function get_object_info($object){
   foreach(get_class_methods(get_class($object)) as $method){
      echo '<p>' . $method . '(';
      foreach((new ReflectionMethod(get_class($object), $method))->getParameters() as $param){
         echo $param . ', ';
      }
      echo ')</p>';
    }
}
{{</highlight>}}

In order to keep this function short, php5.4+ is needed because we're acceding a class member while we instantiate it. To achieve this, we have to use an extra parenthesis:
{{<highlight php>}}
<?php
(new ReflectionMethod($class, $method))->getParameters())
{{</highlight>}}

Is correct in php 5.4
{{<highlight php>}}
<?php
new ReflectionMethod($class, $method))->getParameters()
{{</highlight>}}

Is not correct in any PHP versión, so if we use php < 5.4, we have to separate this line:
{{<highlight php>}}
<?php
$method  = new ReflectionMethod($class, $method);
$params = $method->getParameters();
{{</highlight>}}

## Example
Let's see an example on ProcessWire platform. We want to get data about the current user, but the properties that docs shows are not enough:

![pw cheatsheet](/articles/img/getting-an-objects-methods-1.png)

So, if we want to see the methods for the $user object, we'll see something like this:
{{<highlight php>}}
<?php
hasRole(Parameter #0 [ $role ], )
addRole(Parameter #0 [ $role ], )
removeRole(Parameter #0 [ $role ], )
hasPermission(Parameter #0 [ $name ], Parameter #1 [ $context = NULL ], )
getPermissions(Parameter #0 [ Page or NULL $page = NULL ], )
isSuperuser()
isGuest()
isLoggedin()editUrl()
find(Parameter #0 [ $selector = '' ], Parameter #1 [ $options = Array ], )
children(Parameter #0 [ $selector = '' ], Parameter #1 [ $options = Array ], )
numChildren(Parameter #0 [ $selector = NULL ], )
hasChildren(Parameter #0 [ $selector = true ], )
child(Parameter #0 [ $selector = '' ], Parameter #1 [ $options = Array ], )
parent(Parameter #0 [ $selector = '' ], )
parents(Parameter #0 [ $selector = '' ], )
parentsUntil(Parameter #0 [ $selector = '' ], Parameter #1 [ $filter = '' ], )
closest(Parameter #0 [ $selector ], )
{{</highlight>}}

Some methods give us the same data as the properties, but we can see new methods that could be really useful. The main advantage of obtaining these methods is that we don't depend on docs and we also see the full list of methods for the object.
