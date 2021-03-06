'use strict';

var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var rename = require("gulp-rename");
var minify = require('gulp-minifier');
var replace = require('gulp-replace');
var header = require('gulp-header');
var runSequence = require('run-sequence');
var del = require('del');
var json = JSON.parse(fs.readFileSync('./package.json'));

gulp.task('build-clean', function () {
  return del(['./dist']);
});

gulp.task('build-css', function () {
  return gulp.src('./scss/*.scss').pipe(sourcemaps.init()).pipe(sass().on('error', sass.logError)).pipe(sourcemaps.write()).pipe(gulp.dest('./dist/css'));
});

gulp.task('build-min', function () {
  return gulp.src('./dist/css/siteserver.css')
    .pipe(minify({
      minify: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyJS: false,
      minifyCSS: true,
      minifyHTML: false
    }))
    .pipe(header(`/*!
    * SiteServer UI v` + json.version + ` (https://www.siteserver.cn)
    * Copyright 2013-2018 SiteServer CMS.
    * Licensed under GPL-3.0 (https://github.com/siteserver/siteserver-ui/blob/master/LICENSE)
    */`))
    .pipe(rename('siteserver.min.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('build-fonts', function () {
  return gulp.src('./fonts/**').pipe(gulp.dest('./dist/fonts'));
});

gulp.task('build-docs-assets', function () {
  return gulp.src('./dist/**').pipe(gulp.dest('./docs/assets'));
});

gulp.task('build-docs-replace', function () {
  fs.readFile('./docs-template/include/header.html', 'utf8', function (err, contents) {
    gulp.src('./docs-template/templates/*.html').pipe(replace('<!-- #include file="header.html" -->', contents)).pipe(gulp.dest('./docs'));
  });
});

gulp.task('build', function (callback) {
  runSequence('build-clean', 'build-css', 'build-min', 'build-fonts', 'build-docs-assets', 'build-docs-replace', callback);
});