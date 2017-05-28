const gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    run = require('gulp-run');

let src = './process',
    app = './app';

gulp.task('main', function () {
    return gulp.src(src + '/main.js')
        .pipe(gulp.dest(app));
});

gulp.task('js', function () {
    return gulp.src(src + '/js/*.js')
        .pipe(gulp.dest(app + '/js'));
});

gulp.task('html', function () {
    gulp.src(src + '/*.html')
        .pipe(gulp.dest(app));
});

gulp.task('css', function () {
    gulp.src(src + '/css/*.css')
        // .pipe(concatCss('app.css'))
        .pipe(gulp.dest(app + '/css'));
});

gulp.task('fonts', function () {
    gulp.src('node_modules/bootstrap/dist/fonts/**/*')
        .pipe(gulp.dest(app + '/fonts'));
});

gulp.task('imageMin', function () {
    gulp.src(src + '/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest(app + '/images'))
});

gulp.task('watch', ['serve'], function () {
    gulp.watch(src + '/js/**/*', ['js']);
    gulp.watch(src + '/css/**/*.css', ['css']);
    gulp.watch(src + '/**/*.html', ['html']);
});

gulp.task('serve', ['html', 'main', 'js', 'css', 'imageMin'], function () {
    run('electron app/main.js').exec();
});

gulp.task('default', ['watch', 'fonts', 'serve']);