// https://gist.github.com/aaronwaldon/8657432
// http://blog.trackets.com/2014/05/17/ssh-tunnel-local-and-remote-port-forwarding-explained-with-examples.html
var gulp = require('gulp'),
  compass = require('gulp-compass'),
  autoprefixer = require('gulp-autoprefixer'),
  rename = require('gulp-rename'),
  // minifycss = require('gulp-minify-css'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  livereload = require('gulp-livereload'),
  plumber = require('gulp-plumber');
  // path = require('path');

var sass_dir = './src/sass/**/*.scss',
  js_dir = './src/js/**/*.js';

gulp.task('live', function() {
  livereload.listen();
  gulp.watch(sass_dir, gulp.series('css'));
  gulp.watch(js_dir, gulp.series('js'));

  //reload when files change
  gulp.watch(['config.yaml', 'layouts/**/*.html', 'static/css/*.css', 'static/js/*.js']).on('change', function(file) {
    gulp.src(file)
      .pipe(plumber())
      .pipe(livereload())
  });
});

// sass
gulp.task('css', function() {
   return gulp.src(sass_dir)
    .pipe(plumber())
    .pipe(compass({
      config_file: './config.rb',
      css: 'static/css',
      sass: 'src/sass'
    }))
    .pipe(autoprefixer({
      // browsers: ['last 5 versions'],
      browsers: ['> 1%'],
      remove: true,
    }))
    .pipe(gulp.dest('./static/css/'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./static/css/'));
});

//js
gulp.task('js', function() {
  return gulp.src(js_dir)
    .pipe(concat('main.js'))
    .pipe(gulp.dest('static/js/'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('static/js/'));
});

gulp.task('default', gulp.series('live'));
