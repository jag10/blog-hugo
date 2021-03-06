article_images_dir="content/articles/img"
thumbnails_dir="content/articles/img/thumbs/"
min_dir="content/articles/img/min/"
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
for i in $(find $article_images_dir -maxdepth 1 -type f \( -name "*.jpg" -or -name "*.png" \) ); do
  filename=$(basename $i)
  if [ "$i" -nt "$thumbnails_dir$filename" ] || [ ! -f "$thumbnails_dir$filename" ] || [ "$force" = true ]; then
    echo "converting $i";
    convert "$i" -sampling-factor 4:2:0 -strip -quality 90 -interlace JPEG -colorspace RGB -scale 780 "$min_dir$(basename $i)";
  fi
done;

echo "generating low quality images inside posts"
for i in $(find $article_images_dir -maxdepth 2 -mindepth 2 -type f \( -name "*.jpg" -or -name "*.png" \) ); do
  filename=$(basename $i)
  dirname=$(dirname $i)
  if [ $dirname"/" = $thumbnails_dir ] || [ $dirname"/" = $min_dir ]; then
    continue
  fi
  thumbs_dir=$dirname"/min/"
  if [ "$i" -nt "$thumbs_dir$filename" ] || [ ! -f "$thumbs_dir$filename" ] || [ "$force" = true ]; then
    echo "converting $i";
    convert -strip -interlace Plane -gaussian-blur 0.05 "$i" -scale 780 -quality 90 "$thumbs_dir$filename";
  fi
done;
