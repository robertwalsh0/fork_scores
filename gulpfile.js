const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('babelServer', () => {
  return gulp.src('./dev/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ["syntax-async-functions","transform-regenerator"]
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('babelTests', () => {
  return gulp.src('./spec/dev/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ["syntax-async-functions","transform-regenerator"]
    }))
    .pipe(gulp.dest('./spec/compiled'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch('./dev/**/*.js', ['babelServer']);
  gulp.watch('./spec/dev/**/*.js', ['babelTests']);

});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch']);
