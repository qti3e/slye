const gulp = require("gulp");
const rollup = require("gulp-better-rollup");
const rename = require("gulp-rename");
const typescript = require("rollup-plugin-typescript");
const mergeStream = require("merge-stream");

const uglifyes = require("uglify-es");
const composer = require("gulp-uglify/composer");
const minify = composer(uglifyes, console);

function slyeModule(name) {
  return function() {
    const rollupOptions = {
      external: ["@slye/core", "three"],
      plugins: [
        typescript({
          target: "esnext",
          module: "ESNext"
        })
      ]
    };

    const outputOptions = {
      format: "iife",
      name: "SlyeModule",
      globals: {
        "@slye/core": "slye",
        three: "THREE"
      }
    };

    const jsStream = gulp
      .src("modules/" + name + "/main.ts")
      .pipe(rollup(rollupOptions, outputOptions))
      .pipe(minify())
      .pipe(rename("main.js"))
      .pipe(gulp.dest("./dist/modules/" + name));

    const assets = gulp
      .src("modules/" + name + "/assets/**")
      .pipe(gulp.dest("./dist/modules/" + name + "/assets"));

    return mergeStream(jsStream, assets);
  };
}

module.exports = slyeModule;
