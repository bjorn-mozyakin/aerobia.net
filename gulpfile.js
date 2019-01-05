// Add plugins
var gulp = require('gulp');

// Build
var pug = require('gulp-pug');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');

var spritesmith = require('gulp.spritesmith');
var svgSprite = require('gulp-svg-sprite');

var browserSync = require('browser-sync').create();

// Deploy

// Common
// var concat = require('gulp-concat');
var del = require('del');
var gulpIf = require('gulp-if');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var combine = require('stream-combiner2').obj;

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// Default task
gulp.task('default', function(){
  console.log('It is alive!!!');
});

// Clean
gulp.task('clean', function(){
  return del('./dest');
});

// HTML
gulp.task('html', function(){
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dest'));
});

// PUG
gulp.task('pug', function(){
  return gulp.src('./src/templates/pages/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dest'));
});

// Images
gulp.task('img', function(){
  return gulp.src(['./src/assets/**/*', '!./src/assets/sprite_png/**/*', '!./src/assets/sprite_png', '!./src/assets/sprite_svg/**/*', '!./src/assets/sprite_svg'])
    .pipe(gulp.dest('./dest/assets'));
});

// Sprite
gulp.task('sprite_png', function () {
  var spriteData = gulp.src('./src/img/sprite_png/**/*.{png,jpg,jpeg}')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      // imgPath: '../img/sprite.png',
      cssName: 'sprite.css',
      cssFormat: 'css',
      algorithm: 'top-down',
      padding: 0,
      algorithmOpts: {sort: false}
    }));

  spriteData.img
    .pipe(gulp.dest('./src/img'));

  spriteData.css
    .pipe(gulp.dest('./src/img/sprite_png'));

  return spriteData;
  // return spriteData.pipe(gulp.dest('./'));
});


var config = {
  shape : {
    spacing : {              // Spacing related options
      padding : [0,0,0,0]    // Padding around all shapes
    }
  },
  mode : {
    css : {                   // Activate the «css» mode
      layout: 'vertical',
      render      : {
        css     : true        // Activate CSS output (with default options)
      },
      dest : './',
      sprite: '../sprite.svg',
      bust: false,
      dimensions: {
        extra: true
      }
    }
  }
};

gulp.task('sprite_svg', function () {
  var spriteData = gulp.src('./src/img/sprite_svg/**/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest('./img/sprite_svg'));

  return spriteData;
});

// Styles
gulp.task('sass', function(){
  return gulp.src('./src/**/*.scss')
    .on('data', function(file) {
      console.log(file);
    })
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions', 'ie 11'))
    .pipe(gulpIf(!isDevelopment, combine(
      cssnano(),
      rename({suffix: '.min'}) ))
    )
    .pipe(gulp.dest('./dest'));
});

gulp.task('css', function(){
  return gulp.src('./src/**/*.css')
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 9'))
    .pipe(gulp.dest('./dest'));
});


// complicated tasks
gulp.task('build', function(){
  runSequence('clean', 'pug', 'img', 'sass');
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.pug', ['pug']);
  gulp.watch('./src/assets/**/*.*', ['img']);
  gulp.watch('./src/css/**/*.scss', ['sass']);
});

gulp.task('serve', function(){
  browserSync.init({
    server: './dest'
  });

  browserSync.watch('./dest/**/*.*').on('change', browserSync.reload);
});

gulp.task('devloh', function(){
  runSequence('build', 'watch');
});

gulp.task('dev', function(){
  runSequence('build', ['watch', 'serve']);
});