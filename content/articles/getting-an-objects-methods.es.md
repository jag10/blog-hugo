---
article_image : "getting-an-objects-methods.jpg"
author : "Jeferson"
date : "2016-05-01T13:28:37+02:00"
news_keywords : ["php", "ReflectionMethod"]
pinned : "notpinned"
project : ""
resources:
  - "get_class_methods en php.net": "http://php.net/manual/es/function.get-class-methods.php"
  - "get_class en php.net": "http://php.net/manual/es/function.get-class.php"
  - "The ReflectionMethod class en php.net": "http://php.net/manual/es/class.reflectionmethod.php"
series : []
tags : ["php", "ReflectionMethod"]
title : "Obteniendo los métodos (reflejados) de un objeto"

---
## El problema
Algunas veces no tenemos acceso a la documentación de una plataforma, es incompleta o simplemente no nos apetece buscarla. En esos casos, es conveniente tener algo más que el típico var_dump de un objeto, que sólo nos muestra las propiedades del objeto pero no sus métodos, que en muchos casos nos dan la funcionalidad que buscamos sin tener que navegar entre miles de propiedades. A continuación expongo la función que uso, utiliza la clase ReflectionMethod, la cual nos muestra información acerca de un método, y necesita como parámetros del constructor el nombre de la clase y el método.
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

Para mantener esta función corta, es necesario utilizar php 5.4+, pues estamos accediendo a un miembro de la clase (getParameters) en la instanciación, para lo cual necesitamos un paréntesis extra:
{{<highlight php>}}
<?php
(new ReflectionMethod($class, $method))->getParameters())
{{</highlight>}}

Es correcto en php 5.4+
{{<highlight php>}}
<?php
new ReflectionMethod($class, $method))->getParameters()
{{</highlight>}}

No es correcto en ninguna versión de PHP, por lo que si utilizamos php <5.4, esta línea debería separarse en dos:
{{<highlight php>}}
<?php
$method  = new ReflectionMethod($class, $method);
$params = $method->getParameters();
{{</highlight>}}

## Ejemplo práctico
Vamos a ver un ejemplo práctico en la plataforma ProcessWire. Queremos obtener datos acerca del usuario actual, sin embargo las propiedades que indica la documentación no son suficientes:

![pw cheatsheet](/articles/img/getting-an-objects-methods-1.png)

Si listamos los métodos del objeto $user, veremos algo así:
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

Algunos métodos coinciden con las propiedades, pero también vemos que aparecen muchos más métodos (he recortado la lista) que podrían sernos útiles en muchas situaciones. La ventaja de obtener los métodos así es que no dependemos de la documentación y que vemos cuáles son realmente todos los métodos que podemos utilizar.
