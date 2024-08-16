import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import minifyCSS from 'gulp-minify-css';
import sass from 'sass';

const sassCompiler = gulpSass(sass);

gulp.task('sass', async () => {
  return gulp.src('packages/components/table/style/index.scss')
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series('sass'));

