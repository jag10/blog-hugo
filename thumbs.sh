article_images_dir="content/articles/img"
thumbnails_dir="content/articles/img/thumbs/"
thumbnail_size="140"
force=false

for i in $(find $article_images_dir -maxdepth 1 -type f \( -name "*.jpg" -or -name "*.png" \) ); do
  filename=$(basename $i)
  if [ "$i" -nt "$thumbnails_dir$filename" ] || [ ! -f "$thumbnails_dir$filename" ] || [ "$force" = true ]; then
    echo "converting $i";
    convert "$i" -thumbnail $thumbnail_size -quality 100 "$thumbnails_dir$(basename $i)";
  fi
done;
