var gulp = require('gulp');
var nodemon = require('gulp-nodemon')

gulp.task('serve', () => {
  nodemon({
    script: 'app.js'
  })
});
