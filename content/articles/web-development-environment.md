---
article_image : "web-development-environment.jpg"
author : "Jeferson"
date : "2016-07-27T13:50:40+02:00"
news_keywords : ["sass", "vagrant", "nodejs"]
pinned : "pinned"
project : ""
resources :
  - "VirtualBox 5.1 on Fedora 25/24, CentOS/RHEL 7.3/6.9/5.11": "https://www.if-not-true-then-false.com/2010/install-virtualbox-with-yum-on-fedora-centos-red-hat-rhel/"
  - "Scotch box": "https://box.scotch.io/"
  - "adminer on adminer.org": "https://www.adminer.org/static/download/4.2.5/adminer-4.2.5.php"
series : []
tags : ["sass", "vagrant", "nodejs"]
title : "Web development environment"

---

In this post we'll configure an advanced web development environment. For that, we'll have our web hosted on a server (we will NOT use that server for development), and in our station we'll have a virtual machine. For this vm we'll use vagrant with the  scotch box, which allows us to host a web without extra work
## Prerequisites
We'll use the following tecnologies for our environment. You should review them before going on.

<!--more-->

* Vagrant. Vagrant makes creating dev environments easy and fast
* virtualbox. Vagrant uses vm and for that, it needs virtualbox as a dependency
* nodejs. nodejs gives us the environment to run the dev utilities
* npm. npm lets us install the packages we need for development
* adminer. Adminer is a lightweight phpmyadmin. The main advantage is that we only need one .php file to use it.
* sass. Sass is a css extension which allows us to create more efficient css code, making our code more maintanable
* compass. Compass is a css framework which uses sass
* gulp (autoprefixer, cleanCSS, uglify, etc.) Gulp allows us to automatize tasks
* livereload. With livereload we'll be able to reload automatically the browser when we make changes on sass, js or .php files
* git

## Installing vagrant
Well, the first thing we need to do is install vagrant with virtualbox. Here I'll show you how to do it on Fedora, but it's almost the same on other distros. In first place, we have to install dropbox repo:
{{<highlight sh>}}
cd /etc/yum.repos.d/
wget http://download.virtualbox.org/virtualbox/rpm/fedora/virtualbox.repo
#Instalamos las dependencias
dnf install binutils gcc make patch libgomp glibc-headers glibc-devel kernel-headers kernel-devel dkms
{{</highlight>}}
Next, we'll install virtualbox. I had to install 5.0 versión, because vagrant isn't fully compatible with virtualbox 5.1
{{<highlight sh>}}
dnf install VirtualBox-5.0
{{</highlight>}}
Now we'll install vagrant:
{{<highlight sh>}}
dnf install vagrant
{{</highlight>}}
The next step consists on going to [scotch's web](https://box.scotch.io/) and install his box:
{{<highlight sh>}}
mdir -p ~/vagrant/dev
cd ~/vagrant/dev/
git clone https://github.com/scotch-io/scotch-box.git my-project
vagrant up --provider=virtualbox
{{</highlight>}}
The first time we execute vagrant up it'll have to download the box image and will take its time. Once the machine is installed, we should be able to see it on http://192.168.33.10/
Ok, now we have our virtual environment, the next step is to host our website on the virtual machine. For that, we'll migrate files (using zip for example), and the database. We need to export the db as a .sql file. We can do that with phpmyadmin or in a terminal, type:
{{<highlight sh>}}
mysqldump -u db_username -p db_name > db_name.sql
{{</highlight>}}
By default, scotchbox makes the dir where we installed the vm (~/vagrant/dev) shared with the vm on /var/www, so we can unzip the web files there. We'll have to import the database too. For that, we can use adminer:
{{<highlight sh>}}
cd ~/vagrant/dev/public/
wget https://www.adminer.org/static/download/4.2.5/adminer-4.2.5.php
{{</highlight>}}

If the database dump is larger than 2M, we need to edit the file /etc/php5/apache2/php.ini and modify the upload_max_filesize directive (256M for example). Once the web is migrated, we should check the .htaccess file in case we need to make any modification (disable ssl, for example). Also, we have to modify the connection data for the database:
* Key	          Value
* Database Name	scotchbox
* Database User	root
* Database Password	root
* Database Host	localhost

We can also log in adminer and create a new database.

## Dir structure
The dir structure I use for development is the following:
{{<highlight cirru>}}
/templates/
|-- css < Here we'll save the global.min.css used in production (and any other, if needed)
|-- fonts < well, fonts
|-- img < images used in the template
|-- js < .min.js files used in production
|-- lib < libraries needed in the template
|-- node_modules < nodejs modules used
|-- partials < These files contain some parts of the template itself (widgets, comments...)
|-- src < source code
|----sass < sass files
|------modules < sass utilites, they don't output any css code (variables, placeholders...)
|------partials < partial sass files (menu.sass, article.sass,...)
|------vendor < 3rd party libraries (bootstrap, purecss, foundation...)
|----js < source js files
.php < templates (header.php, footer.php. etc.)
{{</highlight>}}

## Automating tasks

Now we have the dev environment prepared, the next step is to use gulp and compass in order to automatize some tasks like compile sass or minify js files. For that, we need to install ruby in the virtual machine:
{{<highlight sh>}}
vagrant ssh
su root
apt-get install ruby
gem update --system
gem install compass
{{</highlight>}}
Then, we'll install nodejs and npm (using official repos fedora/ubuntu)
{{<highlight sh>}}
apt-get install nodejs npm
{{</highlight>}}
Now we can install and configure gulp:
{{<highlight sh>}}
cd ~/vagrant/dev/
npm init
npm install --global gulp-cli
npm install --save-dev gulp
compass create <project_name>
{{</highlight>}}

Ok, now we have gulp and compass. Now we need to tell gulp which tasks we want to automatize. For that, we have to use a gulpfile.js in our project. Here is the one I use, you can modify it to fit your needs. This file:

* Imports neeeded deps
* Sets the directories which will contain our scss and js files
* Creates the css task, which compiles scss files with sass, uses autoprefixer for back compatibility and then saves a regular css file and a .min.css production version
* Creates js tasks which concatenates all js files and generates regular version and minified version (.min.js)
* Creates 'live' task, which watches scss and js files to compile when needed, and then watch .php, .css and .js files to autoreload the browser when needed

Here is the gulpfile.js, before using it you have to install the needed deps:
{{<highlight sh>}}
npm install --save-dev gulp gulp-compass gulp-autoprefixer gulp-rename gulp-clean-css gulp-uglify gulp-concat gulp-livereload gulp-plumber gulp-path
{{</highlight>}}
{{<highlight js>}}
var gulp = require('gulp'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    // minifycss = require('gulp-minify-css'),
    cleanCSS = require('gulp-clean-css');
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat')
    livereload = require('gulp-livereload')
    plumber = require('gulp-plumber'),
    path = require('path');

var sass_dir = './src/sass/**/*.scss',
    js_dir   = './src/js/**/*.js';

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('live', function(){
  livereload.listen();
  gulp.watch(sass_dir, ['css']);
  gulp.watch(js_dir, ['js']);

  //reload when a template file, the minified css, or the minified js file changes
  gulp.watch(['partials/*.php', '*.php', 'css/*.css', 'js/*.js'], function(event) {
    gulp.src(event.path)
      .pipe(plumber())
      .pipe(livereload())
  });
});

// sass
gulp.task('css', function() {
  gulp.src(sass_dir)
  .pipe(plumber())
  .pipe(compass({
    config_file: './config.rb',
    css: 'css',
    sass: 'src/sass'
  }))
  .pipe(autoprefixer({
    // browsers: ['last 5 versions'],
    browsers: ['> 1%'],
    remove: true,
  }))
  .pipe(gulp.dest('./css'))
  .pipe(rename({ suffix: '.min' }))
  .pipe(cleanCSS())
  .pipe(gulp.dest('./css'));
});

//js
gulp.task('js', function() {
  return gulp.src(js_dir)
  	.pipe(concat('main.js'))
  	.pipe(gulp.dest('js/'))
  	.pipe(rename({ suffix: '.min' }))
  	.pipe(uglify())
  	.pipe(gulp.dest('js/'));
});
{{</highlight>}}

Since we are working on a vm, livereload extension won't detect the livereload server because it'll look for it on localhost:35729. To solve this, we need to redirect theport to our vm. For that:
{{<highlight js>}}
ssh -L 35729:192.168.33.10:35729 vagrant@192.168.33.10
{{</highlight>}}
Now we are set, we can use gulp to automatize tasks. From our project directory:
{{<highlight js>}}
gulp live
{{</highlight>}}

Ok, now we can modify code on ~/vagrant/dev and watch the changes automatically on Chrome (using the livereload chrome extension). This gives us an agile development environment, where we can develop without touching the live site
Now, with git, you can work in the best way you feel comfortable. Personally, I use 3 "infinite" branches:

* master. Code used in the production server
* staging. Here I include production files before going live on master. I don't include any source code (sass, gulpfile.js, etc.).
* dev. Here I have all source code, including sass files, gulpfile, nodejs modules, etc.
This repo doesn't contain the whole website, only the directory I use for the theme/plugin I'm working on

## Notes

* nodejs, npm, gulp, livereload... all these packages should be installed on the virtual machine, although you can install them in the real machine too, except the livereload extension, which has to be on the server (virtual machine)
