var child_process = require('child_process');

var phonegap = child_process.exec("phonegap serve");
var gulp = child_process.exec("gulp");

phonegap.stdout.on('data', function(data) {
  process.stdout.write(data);
});

phonegap.stderr.on('data', function(data) {
  process.stdout.write(data);
  exit_processes();
});

gulp.stdout.on('data', function(data) {
  process.stdout.write(data);
});

gulp.stderr.on('data', function(data) {
  process.stderr.write(data);
  exit_processes();
});

function exit_processes() {
  phonegap.kill();
  gulp.kill();
  process.exit();
}
