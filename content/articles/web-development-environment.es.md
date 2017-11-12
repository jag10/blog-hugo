---
article_image : "web-development-environment.jpg"
author : "Jeferson"
date : "2016-07-27T13:50:40+02:00"
news_keywords : ["sass", "vagrant", "nodejs"]
pinned : "pinned"
project : ""
resources :
  - "VirtualBox 5.1 en Fedora 25/24, CentOS/RHEL 7.3/6.9/5.11": "https://www.if-not-true-then-false.com/2010/install-virtualbox-with-yum-on-fedora-centos-red-hat-rhel/"
  - "Scotch box": "https://box.scotch.io/"
  - "adminer en adminer.org": "https://www.adminer.org/static/download/4.2.5/adminer-4.2.5.php"
series : []
tags : ["sass", "vagrant", "nodejs"]
title : "Entorno para desarrollo web"

---
En este post vamos a ver un entorno avanzado de desarrollo web. Tendremos nuestra web alojada en un servidor (que NO utilizaremos para nada durante el desarrollo), y en nuestra máquina local tendremos una máquina virtual para el sitio web en el que estemos trabajando. Para la máquina virtual utilizaremos vagrant con el stack de [scotch](https://box.scotch.io/), que nos viene preparado para montar directamente el sitio web sin trabajo extra.

## Requisitos previos
Usaremos las siguientes tecnologías. Deberías revisarlas antes de seguir con el artículo.

<!--more-->

* Vagrant. Vagrant permite crear entornos de desarrollo de manera rápida y sencilla
* virtualbox. Vagrant utiliza máquinas virtuales y para ello hace uso de virtualbox
* nodejs. Nodejs proporciona un entorno para ejecutar las utilidades necesarias
* npm. npm permite manejar los paquetes que incluyen utilidades para el desarrollo
* adminer. Se trata de una versión ligera de phpmyadmin. La principal ventaja es que se instala con un único archivo .php
* sass. Sass es una extensión para css que permite producir código css más eficiente, ahorrando trabajo y mejorando la mantenibilidad.
* compass. Compass es un framework css que utiliza sass como lenguaje
* gulp (autoprefixer, cleanCSS, uglify, etc.) Gulp permite automatizar tareas en el desarrollo web
* livereload. Con livereload podremos desarrollar en sass, compilarlo automáticamente con gulp cuando guardemos y actualizar el navegador de manera automática
* git. Git lo utilizaremos para el control de versiones

## Instalando vagrant
Bien, el primer paso es instalar vagrant con virtualbox. Vamos a ver los pasos necesarios en __Fedora__, pero para el resto de distribuciones es muy parecido. En primer lugar, hay que instalar el repositorio de virtualbox. Para ello:
{{ < highlight sh > }}
cd /etc/yum.repos.d/
wget http://download.virtualbox.org/virtualbox/rpm/fedora/virtualbox.repo
#Instalamos las dependencias
dnf install binutils gcc make patch libgomp glibc-headers glibc-devel kernel-headers kernel-devel dkms
{{</highlight>}}
Finalmente, instalaremos virtualbox. Yo he tenido que instalar la versión 5.0 porque actualmente vagrant no es compatible con la versión 5.1:
{{<highlight sh>}}
dnf install VirtualBox-5.0
{{</highlight>}}
Ahora instalaremos vagrant, tan fácil como:
{{<highlight sh>}}
dnf install vagrant
{{</highlight>}}
El siguiente paso consiste en ir a la [web de scotch](https://box.scotch.io/) e instalar su máquina virtual:
{{<highlight sh>}}
mdir -p ~/vagrant/dev
cd ~/vagrant/dev/
git clone https://github.com/scotch-io/scotch-box.git my-project
vagrant up --provider=virtualbox
{{</highlight>}}
La primera vez vagrant tendrá que descargarse la imagen y tardará un tiempo. Una vez la máquina esté instalada, podremos verla en http://192.168.33.10/
Bien, ya tenemos el entorno virtual montado, el siguiente paso es montar la web sobre la que queremos desarrollar en nuestro entorno de pruebas. Para ello migraremos los ficheros (comprimiéndolos en zip) y la base de datos la exportaremos como un fichero .sql ya sea con phpmyadmin o por terminal:
{{<highlight sh>}}
mysqldump -u db_username -p db_name > db_name.sql
{{</highlight>}}
Por defecto, la máquina de scotch hace que el directorio donde instalamos la máquina (~/vagrant/dev) sea compartido con la máquina virtual en /var/www/, por lo que podremos descomprimir ahí la web. Tendremos que importar también la base de datos. Lo más sencillo es utilizar [adminer](https://www.adminer.org/), basta con descargarlo y dejarlo en la raíz de la web:
{{<highlight sh>}}
cd ~/vagrant/dev/public/
wget https://www.adminer.org/static/download/4.2.5/adminer-4.2.5.php
{{</highlight>}}
Si nuestro backup ocupa más de 2M, editaremos el fichero /etc/php5/apache2/php.ini y modificaremos la directiva upload_max_filesize y pondremos un tamaño acorde a nuestras necesidades (256M, por ejemplo). Una vez la web esté importada, es recomendable verificar el fichero .htaccess de nuestra web por si tenemos que hacer modificaciones para adaptarlo al nuevo entorno, como por ejemplo desactivar ssl. Además, deberemos modificar la conexión a la base de datos de nuestra web con los siguientes datos:
* Key	          Value
* Database Name	scotchbox
* Database User	root
* Database Password	root
* Database Host	localhost

También podemos entrar en adminer y crear una nueva base de datos.

## Estructura de directorios
La estructura de ficheros para el desarrollo que utilizo es la siguiente:
{{<highlight cirru>}}
/templates/
|-- css < Aquí se incluye el fichero global.min.css utilizado en producción (y cualquier otro, si hubiera más)
|-- fonts < fuentes
|-- img < imágenes utilizadas en el tema
|-- js < ficheros .min.js de producción
|-- lib < librerías necesarias en el tema
|-- node_modules < módulos utilizados en desarrollo
|-- partials < ficheros que contienen partes del tema (widgets, comentarios, etc)
|-- src < código fuente de desarrollo
|----sass < ficheros sass de desarrollo
|------modules < utilidades sass, no producen código .css (ej: definir variables, placeholders, mixins)
|------partials < ficheros sass para dar estilo a ciertas partes de la web (ej: menu.sass, article.sass, etc.)
|------vendor < librerías de terceros (bootstrap, purecss, foundation, etc.)
|----js < ficheros js de desarrollo
.php < templates (header.php, footer.php. etc.)
{{</highlight>}}

## Automatizando tareas
Ya tenemos el entorno montado, el siguiente paso será utilizar gulp y compass para automatizar algunas tareas como compilar sass o comprimir los ficheros js. Para ello, empezaremos por instalar ruby en la __máquina virtual__:
{{<highlight sh>}}
vagrant ssh
su root
apt-get install ruby
gem update --system
gem install compass
{{</highlight>}}
Luego procederemos a instalar nodejs y npm (disponibles en los repositorios oficiales, sin líos):
{{<highlight sh>}}
apt-get install nodejs npm
{{</highlight>}}
Ahora podremos instalar y configurar gulp para automatizar tareas:
{{<highlight sh>}}
cd ~/vagrant/dev/
npm init
npm install --global gulp-cli
npm install --save-dev gulp
compass create <project_name>
{{</highlight>}}
Ya tenemos gulp y compass disponible, ahora tendremos que indicarle qué tareas queremos automatizar. Aquí voy a poner el gulpfile.js que utilizo yo, puedes modificarlo para ajustarlo a tus necesidades. Este fichero hace:

* Inicializa todas las dependencias necesarias
* Establece los directorios en que van a estar nuestros ficheros scss y js
* Crea la tarea 'css', que se encarga de compilar los ficheros scss con compass, llamar a autoprefixer para obtener compatibilidad con 2 las últimas de los principales navegadores y finalmente escribir en disco una versión normal de los css y su versión para producción (.min.css)
* Crea la tarea 'js' que se encarga de concatenar todos los ficheros js en uno solo y de generar su versión normal y de producción (.min.js)
* Crea la tarea 'live', que se encarga de inicializar livereload, vigilar los ficheros scss y js para compilar cuando sea necesario y finalmente, vigilar ficheros .php, .css y .js para autorecargar el navegador cuando sea necesario.

Aquí os dejo el fichero gulpfile.js. Antes de utilizarlo hay que instalar las dependencias necesarias:

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

Como estamos trabajando en una máquina virtual, la extensión livereload no verá el servidor livereload porque lo va a buscar en localhost:35729. Para solucionarlo, tendremos que redigir el puerto 35729 de nuestra máquina local al puerto 35729 de la máquina virtual. Para ello:
{{<highlight js>}}
ssh -L 35729:192.168.33.10:35729 vagrant@192.168.33.10
{{</highlight>}}
Ya está todo listo, ahora podremos utilizar gulp para automatizar tareas. Desde el directorio del proyecto:
{{<highlight js>}}
gulp live
{{</highlight>}}
Ya tenemos todo listo, si hemos seguido los pasos podremos modificar código en ~/vagrant/dev y ver los cambios de manera instantánea en Chrome, lo que nos da un entorno de trabajo muy ágil y en el que podremos hacer las pruebas que queramos sin afectar al entorno real.
En cuanto a la metodología a utilizar en git, queda a elección del desarrollador. Personalmente, siempre tengo 3 branches "infinitos", que son:

* master. Contiene el código que se utiliza en el servidor web
* staging. Aquí se incluye el código fuente antes de pasarlo al master. Es un entorno preparado para ser lo más parecido posible al entorno final, por ello no se incluyen los ficheros utilizados en desarrollo (sass y js). Sólo se incluyen sus versiones minificadas para producción
* dev. Aquí se incluye todo el código del template, incluyendo ficheros sass, js, gulpfile, package.json, etc.

Este repositorio no contiene toda la web, sólo el directorio que contiene el tema/plugin que se esté desarrollando.
## Aclaraciones

nodejs, npm, gulp, livereload... todos estos paquetes deben instalarse en la máquina virtual, aunque por comodidad también pueden instalarse en la máquina real, excepto livereload, que tiene que estar en el servidor (máquina virtual)
