---
article_image: "unreal_engine.jpg"
author: "Jeferson Arboleda"
author_description: "Computer engineer, interested in Linux, server technologies and eCommerce platforms, learning everyday."
author_photo: "jag.jpg"
date: "2017-03-17T21:33:19+02:00"
pinned: "pinned"
resources:
  - "Building on linux": "https://wiki.unrealengine.com/Building_On_Linux"
  - "Running on linux": "https://wiki.unrealengine.com/Running_On_Linux"
series: ""
tags: ["unrealengine", "fedora25"]
title: "installing unreal engine on fedora 25"
---

Firstly, you need to signup in github and then link your github account with your epic games account:
https://www.unrealengine.com/ue4-on-github
Then you should receive an email confirming you joined up to the epic games organization. Once you receive it, you can clone the source code of unreal engine:
{{<highlight sh>}}
git clone https://github.com/EpicGames/UnrealEngine.git
cd UnrealEngine/
./Setup.sh
./GenerateProjectFiles.sh
{{</highlight>}}
In my case (Fedora 25), this last command failed, had to install clang:
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
 After that, you should be able to run UnrealEngine Editor:
{{<highlight sh>}}
$ ./UE4Editor "/home/user/Documents/Unreal\ Projects/MyProject/MyProject.uproject"
{{</highlight>}}
Further info:
Building on linux
Running on linux