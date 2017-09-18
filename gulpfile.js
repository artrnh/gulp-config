var gulp = require("gulp"),
sass = require("gulp-sass"),
plumber = require("gulp-plumber"),
postcss = require("gulp-postcss"),
autoprefixer = require("autoprefixer"),
server = require("browser-sync"),
mqpacker = require("css-mqpacker"),
minify = require("gulp-csso"),
rename = require("gulp-rename"),
imagemin = require("gulp-imagemin"),
svgstore = require("gulp-svgstore"),
svgmin = require("gulp-svgmin"),
useref = require("gulp-useref"),
uglify = require("gulp-uglify"),
gulpIf = require("gulp-if"),
cache = require("gulp-cache"),
del = require('del'),
run = require('run-sequence');

gulp.task("style", function () {
  gulp.src("scss/main.scss")
  .pipe(plumber())
  .pipe(sass())
  .pipe(postcss([
    autoprefixer({
      browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions",
      ]}),
    mqpacker({
      sort: true
    })
  ]))
  .pipe(gulp.dest("css"))
  .pipe(minify())
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("css"))
  .pipe(server.reload({ stream: true }));
});

gulp.task("serve", ["style"], function () {
  server.init({
    server: "."
  });

  gulp.watch("scss/**/*.scss", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
  gulp.watch("js/**/*.js").on("change", server.reload);
}); 

gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,gif}")
  .pipe(imagemin([
    imagemin.optipng({ optimizationLevel: 3 }),
    imagemin.jpegtran({ progressive: true })
  ]))
  .pipe(gulp.dest("img"));
});

gulp.task("symbols", function () {
  return gulp.src("img/icons/*.svg")
  .pipe(svgmin())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("symbols.svg"))
  .pipe(gulp.dest("img"));
});

gulp.task('concat', function () {
  return gulp.src('./*.html')
  .pipe(gulpIf('*.js', uglify()))
  .pipe(useref())
  .pipe(gulp.dest('.'))
});

gulp.task("copy", function () {
  return gulp.src([
    "img/**",
    "css/**",
    "js/**",
    "fonts/**",
    "*.html"
  ], {
      base: "."
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", function (fn) {
  run("clean", "style", "images", "symbols", "concat", "copy", fn);
});

gulp.task('default', ['serve']);