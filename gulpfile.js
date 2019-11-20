var gulp = require("gulp"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  babel = require("gulp-babel"),
  minifyCSS = require("gulp-minify-css"),
  sass = require("gulp-sass"),
  htmlmin = require("gulp-htmlmin"),
  clean = require("gulp-clean"),
  autoprefixer = require("gulp-autoprefixer"),
  image = require("gulp-image"),
  webp = require("gulp-webp"),
  svgSprite = require("gulp-svg-sprites"),
  cheerio = require("gulp-cheerio"),
  replace = require("gulp-replace"),
  gls = require('gulp-live-server'),
  connect = require('gulp-connect');

gulp.task("svg-sprite", function() {
  return (
    gulp
      .src("./assets/img/svg/*.svg")
      .pipe(
        cheerio({
          run: function($) {
          },
          parserOptions: { xmlMode: true }
        })
      )
      // cheerio plugin create unnecessary string '>', so replace it.
      .pipe(replace("&gt;", ">"))
      // build svg sprite
      .pipe(
        svgSprite({
          mode: "symbols",
          preview: false,
          selector: "icon-%f",
          svg: {
            symbols: "symbol_sprite.html"
          }
        })
      )
      .pipe(gulp.dest("./build/img/"))
  );
});

gulp.task("image-to-webp", () =>
  gulp
    .src("./assets/img/*")
    .pipe(webp())
    .pipe(gulp.dest("./build/img"))
);

gulp.task("image-min", () =>
  gulp
    .src("./assets/img/*")
    .pipe(image())
    .pipe(gulp.dest("./build/img"))
    .pipe(connect.reload())
);

gulp.task("compile-sass", function() {
  return gulp
    .src(["./assets/scss/*.scss"])
    .pipe(sass())
    .pipe(concat("style.css"))
    .pipe(gulp.dest("./assets/css/"));
});

gulp.task("minify-css", function() {
  return gulp
    .src(["./assets/css/*.css"])
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(minifyCSS())
    .pipe(gulp.dest("./build/css"))
    .pipe(connect.reload());
});

gulp.task("minifyhtml", function() {
  return gulp
    .src(["./*.html"])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./build/"))
    .pipe(connect.reload());
});

gulp.task("minify-main-js", function() {
  return gulp
    .src(["./assets/js/common.js"])
    .pipe(
      babel({
        presets: ["env"]
      })
    )
    .pipe(uglify())
    .pipe(concat("common.min.js"))
    .pipe(gulp.dest("./assets/js/"))
});

gulp.task("scripts", function() {
  return gulp
    .src([
      "./assets/js/jquery.min.js",
      "./assets/js/anime.min.js",
      "./assets/js/bootstrap.min.js",
      "./assets/js/common.min.js"
    ])
    .pipe(concat("main.js"))
    .pipe(gulp.dest("./build/js/"))
    .pipe(connect.reload());
});

// Чистим директорию назначения и делаем ребилд, чтобы удаленные из проекта файлы не остались
gulp.task("clean", function() {
  return gulp
    .src(["./assets/css/style.css"], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task("clean-js", function() {
  return gulp
    .src(["./assets/js/common.min.js"], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task("clean-old", function() {
  return gulp
    .src(["./build/css/style.min.css"], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});

function watchFiles() {
  gulp.watch(
    "./assets/scss/*.scss",
    gulp.series(["clean-old", "compile-sass", "minify-css", "clean"])
  );
  gulp.watch(
    "./*.html",
    gulp.series(["minifyhtml"])
  );
  gulp.watch(
    "./assets/js/common.js",
    gulp.series(["minify-main-js", "scripts", "clean-js"])
  );
  gulp.watch(
    "./assets/img/*",
    gulp.series(["image-to-webp", "image-min", "svg-sprite"])
  );
}

const dev = gulp.series(
  "clean-old",
  "compile-sass",
  "minify-css",
  "minifyhtml",
  "minify-main-js",
  "scripts",
  "clean",
  "clean-js",
  "image-to-webp",
  "image-min",
  "svg-sprite"
);

const build = gulp.series(
  "clean-old",
  "compile-sass",
  "minify-css",
  "minifyhtml",
  "minify-main-js",
  "scripts",
  "clean",
  "clean-js",
  "image-to-webp",
  "image-min",
  "svg-sprite"
);

const min_images = gulp.series("image-min", "image-to-webp");

const watch = gulp.parallel('connect', watchFiles);

exports.dev = dev;
exports.build = build;
exports.default = watch;
exports.min_images = min_images;
