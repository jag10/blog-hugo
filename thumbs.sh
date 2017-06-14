article_images_dir="content/articles/img"
thumbnails_dir="content/articles/img/thumbs/"
thumbnail_size="72"

for i in $(find $article_images_dir -maxdepth 1 -type f \( -name "*.jpg" -or -name "*.png" \) ); do
  if [ "$i" -nt "$thumbnails_dir$i" ] || [ ! -f "content/articles/img/thumbs/$i" ]; then
    echo "converting $i";
    convert "$i" -thumbnail $thumbnail_size "$thumbnails_dir$(basename $i)";
  fi
done;
