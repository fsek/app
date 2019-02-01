var child_process = require('child_process');

// The process.argv contains arguments. First 2 are not user defined and are removed
// Pass arguments as this: npm start -- arg1 arg2
var phonegap = child_process.exec("phonegap serve " + process.argv.slice(2, process.argv.length).join(' '));
var gulp = child_process.exec("gulp");

phonegap.stdout.on('data', function (data) {
  process.stdout.write(data);
});

phonegap.stderr.on('data', function (data) {
  process.stdout.write(data);
  exit_processes();
});

gulp.stdout.on('data', function (data) {
  process.stdout.write(data);
});

gulp.stderr.on('data', function (data) {
  process.stderr.write(data);
  exit_processes();
});

function exit_processes() {
  phonegap.kill();
  gulp.kill();
  process.exit();
}
