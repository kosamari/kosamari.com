var gulp   = require('gulp'),
    sass   = require('gulp-sass'),
    rename = require('gulp-rename'),
    logger = require('../util/logger'),
    errors = require('../util/errors');

module.exports = function(src,out,name){
  logger.start('sass for ' + name);
  gulp.src(src)
    .pipe(sass({errLogToConsole: true}))
    .pipe(rename(name + '.css'))
    .pipe(gulp.dest(out))
    .on('end', logger.end);
}
