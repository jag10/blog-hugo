---
article_image : "installing-ubuntu-16.04-on-odroid-xu3-lite.jpg"
author : "Jeferson"
date : "2016-07-18T13:37:52+02:00"
news_keywords : ["ubuntu", "odroid", "mate"]
pinned : "notpinned"
project : ""
resources :
  - "Ubuntu ISOs para odroid xu3 lite": "http://de.eu.odroid.in/ubuntu_16.04lts/"
  - "odroid flashing tools": "http://odroid.com/dokuwiki/doku.php?id=en:odroid_flashing_tools"
  - "dd en linux.die.net": "https://linux.die.net/man/1/dd"
series : []
tags : ["ubuntu", "odroid", "mate"]
title : "Instalando ubuntu 16.04 en odroid xu3 lite"

---

## Eligiendo una imagen
La versión 16.04 de ubuntu acaba de ser liberada por parte del equipo de odroid para las placas xu3 y xu4 y sus variantes lite. En este caso vamos a probar ubuntu 16.04 en la placa odroid xu3 lite que es la que poseo con un módulo eMMC, que para entendernos viene a ser un disco ssd pequeñito (en realidad no es lo mismo, eMMC es más lento), lo cual nos da mayor rendimiento, aunque también se puede instalar en una memoria sd (recomendable clase 10). Lo primero será descargarnos la imagen que necesitemos:
http://de.eu.odroid.in/ubuntu_16.04lts/
De aquí he tomado el fichero que me interesa, correspondiente a la versión completa de ubuntu y a la placa xu3:

* [ubuntu-16.04-mate-odroid-xu3-20160708.img.xz](http://de.eu.odroid.in/ubuntu_16.04lts/ubuntu-16.04-mate-odroid-xu3-20160708.img.xz)

## Escribiendo la imagen en la placa odroid
El siguiente paso será descomprimir la imagen, muy importante antes de proceder a escribirla en el módulo eMMC, para ello:
[jag@2ndChance distros]$ unxz ubuntu-16.04-mate-odroid-xu3-20160708.img.xz
La manera más comoda de instalar la distro en la placa es utilizando el comando dd de linux:
{{<highlight sh>}}
[jag@2ndChance distros]$ sudo dd if=ubuntu-16.04-mate-odroid-xu3-20160708.img of=/dev/sdc bs=1M conv=fsync
[jag@2ndChance distros]$ sync
[jag@2ndChance distros]$ sync
[jag@2ndChance distros]$ sync
[jag@2ndChance distros]$ sync
{{</highlight>}}
## Verificando el resultado
Es importante utilizar el comando sync varias veces para asegurarse de que no se queda nada en caché y que toda la imagen se escribe en el módulo eMMC.
Para verificar que la imagen se ha escrito correctamente utilizaremos dd de nuevo:
{{<highlight sh>}}
[jag@2ndChance distros]$ sudo dd if=/dev/sdc bs=512 count=$((`stat -c%s ubuntu-16.04-mate-odroid-xu3-20160708.img`/512)) | md5sum
[sudo] password for jag:
8968192+0 registros leídos
8968192+0 registros escritos
4591714304 bytes (4,6 GB) copiados, 106,332 s, 43,2 MB/s
ff988a4039d9bcd6978910447930f5d5 -
[jag@2ndChance distros]$ dd if=ubuntu-16.04-mate-odroid-xu3-20160708.img bs=512 count=$((`stat -c%s ubuntu-16.04-mate-odroid-xu3-20160708.img`/512)) | md5sum
8968192+0 registros leídos
8968192+0 registros escritos
4591714304 bytes (4,6 GB) copiadosff988a4039d9bcd6978910447930f5d5 -
, 26,0306 s, 176 MB/s
[jag@2ndChance distros]$
{{</highlight>}}
Lo que hemos hecho con el primer comando es escribir un volcado del módulo eMMC (/dev/sdc) a stdout para obtener su md5 con una tubería. Con el segundo comando, lo que hacemos es escribir la imagen a stdout y volver a obtener su md5. Comparando ambos valores sabremos si la imagen que hemos descargado se corresponde con lo que se ha escrito en el módulo eMMC
Como veis los md5 coinciden por lo que todo ha funcionado bien. He probado la distro y la primera mejora que he notado ha sido el hdmi. En la anterior versión era un dolor de cabeza hacer que la placa se conectara a mi televisión por hdmi, pero esta vez todo ha ido perfectamente sin tener que tocar ninguna configuración. Sólo una pega y es la conexión por cable Ethernet, no va todo lo bien que debería, muchas veces no se conecta a la primera.
Si todo ha ido bien, podremos conectarnos a nuestra placa por ssh. En mi caso tengo una dirección estática asignada en el router, pero si no conoces la IP que tiene asignada tendrás que entrar al router y ver la lista de clientes dhcp. Una vez conozcamos la IP de la placa, los datos para el login son los siguientes:

## UPDATE

* Después de actualizar algunos paquetes y revisar los cables, la conexión Ethernet funciona perfectamente.
