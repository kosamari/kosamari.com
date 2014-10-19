var fs       = require('fs'),
  gulp       = require('gulp'),
  copy       = require('./copy'),
  browserify = require('./browserify'),
  sass       = require('./sass');
  srcdir     = fs.readdirSync('./src/');

gulp.task('build', function(){
  srcdir.forEach(function(dir){
    if(fs.lstatSync('./src/'+dir).isDirectory()){
      browserify('./src/'+dir+'/javascript/main.js','./builds',dir);
      sass('./src/'+dir+'/styles/main.scss','./builds',dir);
    }
  });
});