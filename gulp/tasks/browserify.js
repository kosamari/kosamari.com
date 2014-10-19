var gulp       = require('gulp'),
  browserify   = require('browserify'),
  logger       = require('../util/logger'),
  errors       = require('../util/errors'),
  source       = require('vinyl-source-stream');

module.exports = function(src,out,name){
  var bundler = browserify({
    entries: [src],
    extensions: ['.js', '.html']
  });

  function bundle() {
    logger.start('browserify for '+name);

    return bundler
      .bundle({debug: true})
      .on('error', errors)
      .pipe(source(name+'.js'))
      .pipe(gulp.dest(out))
      .on('end', logger.end);
  };

  return bundle();
}