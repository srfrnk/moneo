var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('default', function() {});
gulp.task('test', function() {
    return gulp.src('tests.js')
        .pipe(jasmine());
});
