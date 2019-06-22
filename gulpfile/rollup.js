const gulp = require("gulp");
const path = require("path");
const rollup = require("gulp-better-rollup");
const rename = require("gulp-rename");
const typescript = require("rollup-plugin-typescript");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");

const uglifyes = require("uglify-es");
const composer = require("gulp-uglify/composer");
const minify = composer(uglifyes, console);

function slyeRollup(input, out, options = {}) {
  return function(cb) {
    const rollupOptions = {
      external: [
        "electron",
        "fs",
        "path",
        "assert",
        "util",
        "events",
        "crypto",
        "os",
        // Archive extraction fails silently otherwise.
        "tar",
        // Never include three.
        "three"
      ],
      plugins: [
        resolve({
          preferBuiltins: true
        }),
        commonjs(),
        typescript({
          target: "esnext",
          module: "ESNext"
        })
      ],
      ...options
    };

    return gulp
      .src(input)
      .pipe(rollup(rollupOptions, "cjs"))
      .pipe(minify())
      .pipe(rename(out))
      .pipe(gulp.dest("./dist"));
  };
}

module.exports = slyeRollup;
