var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var w = 'www/'

gulp.task('scss', function() {
  return gulp.src(w + 'scss/*.scss')
    .pipe(sass({load_paths: w + 'scss/partials/'}).on('error', sass.logError))
    .pipe(gulp.dest(w + 'dist/css/'));
});

gulp.task('watch', function() {
  gulp.watch(w + 'scss/*/*.scss', ['scss']);
});

gulp.task('default', ['watch', 'scss']);
