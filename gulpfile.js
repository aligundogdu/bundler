var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync').create(),
    nunjucksRender = require('gulp-nunjucks-render'),
    data = require('gulp-data');


gulp.task('images', function () {
    gulp.src('src/assets/img/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('dist/assets/img/'));
});

gulp.task('styles', function () {
    return gulp.src(
        [
            'src/assets/sass/**/*.scss',
            'node_modules/bootstrap/scss/bootstrap.scss',
            'node_modules/animate.css/animate.css',
            'node_modules/font-awesome/css/font-awesome.css',
            'node_modules/slick-carousel/slick/slick.scss'
        ]
    )
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('app.css'))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('dist/assets/css/'))
        .pipe(browserSync.stream());

});

gulp.task('scripts', function () {
    return gulp.src(['src/assets/js/*.js'])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/assets/js/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .on('error', function (err) {
            console.log(err.toString());
        })
        .pipe(gulp.dest('dist/assets/js/'))
        .pipe(browserSync.reload({stream: true}))
        .pipe(browserSync.stream());
});

gulp.task('libJS', function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/popper.js/dist/umd/popper.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/slick-carousel/slick/slick.min.js',
        'node_modules/isotope-layout/dist/isotope.pkgd.min.js'
    ])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('src/assets/js/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js/'))
        .pipe(browserSync.stream());
});

gulp.task('nunjucks', function () {
    return gulp.src('src/views/pages/*.+(nunjucks)')
        .pipe(nunjucksRender({
            path: ['src/views']
        }))
        .pipe(plumber())
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});
//
gulp.task('fonts', function () {
    return gulp.src([
        'node_modules/slick-carousel/slick/fonts/slick.*',
        'node_modules/font-awesome/fonts/*.*'
    ])
        .pipe(gulp.dest('dist/assets/fonts/'));
});

gulp.task('serve', function () {

    (gulp.parallel("libJS")());
    (gulp.parallel("nunjucks")());
    (gulp.parallel("scripts")());
    (gulp.parallel("images")());
    (gulp.parallel("styles")());
    (gulp.parallel("fonts")());

    browserSync.init({
        server: "dist/"
    });

    gulp.watch("src/assets/sass/**/*.scss", gulp.series('styles')).on('change', browserSync.reload);
    gulp.watch("src/assets/js/*.js", gulp.series('scripts')).on('change', browserSync.reload);
    gulp.watch("src/views/**/*.+(html|nunjucks)", gulp.series('nunjucks')).on('change', browserSync.reload);
    gulp.watch("dist/*.html").on('change', browserSync.reload);
});

