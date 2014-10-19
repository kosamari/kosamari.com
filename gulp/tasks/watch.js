var gulp = require('gulp'),
  copy   = require('./copy'),
  browserify = require('./browserify'),
  sass   = require('./sass');

gulp.task('watch', ['setWatch'], function() {

  //browserify javascript for each app dir
  gulp.watch('./src/**/javascript/**', function(event){
    var dir = getDirName(event);
     browserify('./src/'+dir+'/javascript/main.js','./builds',dir);
  });

  //compile Sass for each app dir
  gulp.watch('./src/apps/**/styles/**', function(event) {
    var dir = getDirName(event);
    sass('./src/'+dir+'/styles/main.scss','./builds',dir);
  });

});

function getDirName(event){
  var str = event.path;
  var re = /src\/(.*?)\//;
  var match = str.match(re);
  return match[1]
}