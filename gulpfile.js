const gulp = require('gulp');
const exec = require('child_process').exec;
const del = require('del');
const sass = require('gulp-sass');
const browser_sync = require('browser-sync').create();

const sphinx_build_path = '../build'
const sphinx_source_path = '../source'
const theme_dst_path = '../source/_themes/sphinx_rtd_theme';
const theme_src_path = './sphinx_rtd_theme';

gulp.task('sass', (cb) => {
    gulp.src('sass/**/*.sass')
        .pipe(sass({
            includePaths: [
                'node_modules/bourbon/app/assets/stylesheets',
                'node_modules/wyrm/sass',
                'node_modules/font-awesome/scss',
                'node_modules/bourbon-neat/app/assets/stylesheets']
        }).on('error', sass.logError))
        .pipe(gulp.dest(theme_src_path + '/static/css'));
    cb();
});

gulp.task('copy:fonts', (cb) => {
    gulp.src('fonts/**/*')
        .pipe(gulp.dest(theme_src_path + "/static/fonts"));
    cb();
})

gulp.task("copy:theme", (cb) => {
    gulp.src(theme_src_path + '/**/*.html')
        .pipe(gulp.dest(theme_dst_path));
    cb();
});

gulp.task("copy:static", (cb) => {
    gulp.src(theme_src_path + '/static/**/*')
        .pipe(gulp.dest(theme_dst_path + '/static'));
    cb();
});

gulp.task('build:sphinx', (cb) => {
    exec('make -C ../ html', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('clean:build', () => {
    return del([sphinx_build_path + '**/*'], {force:true});
});

gulp.task('watch:sphinx', () => {
    return gulp.watch([
        sphinx_source_path + '/**/*.rst'], gulp.series('sphinx'))
});

gulp.task('watch:theme', () => {
    return gulp.watch([
        theme_src_path + '/**/*.html'], gulp.series('copy', 'sphinx'))
});

gulp.task('watch:sass', () => {
    return gulp.watch([
        'sass/**/*.sass'], gulp.series('sass', 'copy:static', 'sphinx'))
});

gulp.task('watch:build', () => {
    browser_sync.init({
        server: {
            baseDir: sphinx_build_path + '/html'
        }
    });
    return gulp.watch(sphinx_build_path + '/html/**/*', (done) => {
        browser_sync.reload()
        done()
    });
});

gulp.task('copy', gulp.series('copy:fonts', 'copy:static', 'copy:theme'))
gulp.task('sphinx', gulp.series('clean:build','build:sphinx'))
gulp.task('build', gulp.series('sass', 'copy', 'sphinx'));
gulp.task('watch', gulp.parallel('watch:sass', 'watch:theme', 'watch:sphinx', 'watch:build'))
