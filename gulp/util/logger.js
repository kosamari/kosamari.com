var gutil        = require('gulp-util');
var prettyHrtime = require('pretty-hrtime');
var startTime;

module.exports = {
  start: function(str) {
    startTime = process.hrtime();
    gutil.log('Running', gutil.colors.green(str) + '...');
  },

  end: function() {
    var taskTime = process.hrtime(startTime);
    var prettyTime = prettyHrtime(taskTime);
    gutil.log('Finished', gutil.colors.green('bundle'), 'in', gutil.colors.magenta(prettyTime));
  }
};