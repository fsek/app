var gulp = require('gulp');
var sass = require('gulp-sass');
var w = 'www/'

function compile_scss(cb) {
  return gulp.src(w + 'scss/*.scss')
    .pipe(sass({ load_paths: w + 'scss/partials/' }).on('error', sass.logError))
    .pipe(gulp.dest(w + 'compiled_css/'));
}

function watch_scss(cb) {
  gulp.watch(w + 'scss/*/*.scss', compile_scss);
}


exports.default = gulp.series(compile_scss, watch_scss);
exports.compile = compile_scss;
