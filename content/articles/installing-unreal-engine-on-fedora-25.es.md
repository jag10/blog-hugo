---
article_image: "unreal_engine.min.jpg"
author: Jeferson
date: "2017-03-17T21:33:19+02:00"
news_keywords:  ["unrealengine", "fedora25"]
pinned: "notpinned"
project: "true"
resources:
  - "Building UnrealEngine on linux": "https://wiki.unrealengine.com/Building_On_Linux"
  - "Running UnrealEngine on linux": "https://wiki.unrealengine.com/Running_On_Linux"
series: ["serie1"]
tags: ["unrealengine", "fedora25"]
title: "Instalando unreal engine en fedora 25"
---
## Enlazando GitHub con EpicGames
Primero, hay que registrarse en gihhub y luego asociar la cuenta de github con la de epic games:
https://www.unrealengine.com/ue4-on-github
Entonces deberías recibir un email confirmando que te has unido a la organización Epic Games. Una vez lo recibas, podrás clonar el código fuente del Unreal Engine.
{{<highlight sh>}}
git clone https://github.com/EpicGames/UnrealEngine.git
cd UnrealEngine/
./Setup.sh
./GenerateProjectFiles.sh
{{</highlight>}}
<!--more-->

## Instalando clang
En mi caso (Fedora 25), este último comando falló. Para arreglarlo tuve que instalar clang:
{{<highlight sh>}}
sudo dnf install clang
clang --version
clang version 3.9.1 (tags/RELEASE_391/final)
Target: x86_64-unknown-linux-gnu
Thread model: posix
InstalledDir: /usr/bin
./GenerateProjectFiles.sh
make
{{</highlight>}}
Después de esto, deberías poder ejecutar el editor de Unreal Engine:
{{<highlight sh>}}
$ ./UE4Editor "/home/user/Documents/Unreal\ Projects/MyProject/MyProject.uproject"
{{</highlight>}}
