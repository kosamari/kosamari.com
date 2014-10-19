var gulp = require('gulp');

module.exports = function(src,out){
  gulp.src(src)
    .pipe(gulp.dest(out));
}
