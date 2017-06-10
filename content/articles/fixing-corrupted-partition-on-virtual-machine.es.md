+++
article_image = "fixing-corrupted-partition-on-virtual-machine.jpg"
author = "Jeferson"
date = "2016-07-28T14:07:04+02:00"
description = ""
news_keywords = []
pinned = "notpinned"
project = ""
resources = []
series = []
tags = ["vagrant", "vm", "ubuntu"]
title = "Arreglando una partición corrupta de una máquina virtual"

+++
## Detección del error
Si alguna vez encuentras el siguiente error al utilizar vagrant o simplemente al arrancar una máquina virtual, más abajo veremos cómo solucionarlo:
{{<highlight sh>}}
Couldn't remount RDWR because of unprocessed orphan inode list.
{{</highlight>}}
## Solución
Descargar ISO de ubuntu

Arrancar la máquina virtual con la ISO: Settings -> Storage -> Add CD/DVD Device -> Choose disk
Desmontar /dev/sda1:
{{<highlight sh>}}
sudo umount /dev/sda1
{{</highlight>}}
Comprobar la partición dañada:
{{<highlight sh>}}
fsck /dev/sda1
{{</highlight>}}
Saldrán algunas preguntas, contestar si a todo. Cuando acabe, reiniciamos la máquina arrancando desde el hdd. Es posible que se nos pida el login, para poder ponerlo necesitaremos lanzar la máquina virtual directamente desde virtualbox. Una vez nos logueemos, guardamos el estado de la máquina y la próxima vez se podrá utilizar desde vagrant sin problema
