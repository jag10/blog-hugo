---
article_image: "deploy-hugo-site-to-github-pages.jpg"
author : Jeferson
date : "2017-08-13T11:07:16+02:00"
news_keywords: ["hugo", "static", "github", "pages"]
pinned : "notpinned"
project: "" #true for projects
resources :
  - "Hugo - Host on GitHub": "https://gohugo.io/hosting-and-deployment/hosting-on-github/#host-github-user-or-organization-pages"
series : []
tags : ["hugo", "static", "github", "pages"]
title : "Deploying a hugo site to github pages"
---

In this post we'll see how to deploy a static site built with hugo to github pages.
For this task, we'll use a couple of bash scripts that will:

* Commit changes and push them to github.
* Generate thumbnails and low quality versions of the images used in the blog so it loads faster.

<!--more-->

## Setting up github pages
Firstly, you should head to hugo site. More precisely to [this link](https://gohugo.io/hosting-and-deployment/hosting-on-github/#host-github-user-or-organization-pages).

## Automating deploys
Once you're done with this setup, you just need to add the ``thumbs.sh`` script to the ``deploy.sh`` script.
You have to tweak a llitle this script in order to fit your needs (dir names mostly).
These scripts need to be placed in the root of your hugo site.

{{<highlight sh>}}
article_images_dir="content/articles/img"
thumbnails_dir="content/articles/img/thumbs/"
thumbnail_size="140"
force=false

echo "generating thumbnails";
for i in $(find $article_images_dir -maxdepth 1 -type f \( -name "*.jpg" -or -name "*.png" \) ); do
  filename=$(basename $i)
  if [ "$i" -nt "$thumbnails_dir$filename" ] || [ ! -f "$thumbnails_dir$filename" ] || [ "$force" = true ]; then
    echo "converting $i";
    convert "$i" -thumbnail $thumbnail_size -quality 100 "$thumbnails_dir$(basename $i)";
  fi
done;

echo "generating low quality images"
for i in $(find $article_images_dir -maxdepth 2 -mindepth 2 -type f \( -name "*.jpg" -or -name "*.png" \) ); do
  filename=$(basename $i)
  dirname=$(dirname $i)
  if [ $dirname"/" = $thumbnails_dir ]; then
    continue
  fi
  thumbs_dir=$dirname"/min/"
  if [ "$i" -nt "$thumbs_dir$filename" ] || [ ! -f "$thumbs_dir$filename" ] || [ "$force" = true ]; then
    echo "converting $i";
    convert "$i" -scale 800 -quality 100 "$thumbs_dir$filename";
  fi
done;
{{</highlight>}}

This script will look into ``article_images_dir`` with a depth of 1 (these are
 main images for posts) and generate a thumbnail for each image it finds there.
 It'll save this thumbnail in the the ``thumbnails_dir`` directory.

Also, it will generate low quality versions for images in the ``article_images_dir`` directory
with a depth of 2 (these are images used inside each post) and place them in a
directory named ``min``.
