const gulp = require("gulp");
const path = require("path");

const Bundler = require("parcel-bundler");
const rollup = require("gulp-better-rollup");
const rename = require("gulp-rename");

const typescript = require("rollup-plugin-typescript");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");

gulp.task("electron:main", function() {
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
      // Don't include three.
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
      }),
    ]
  };

  return gulp
    .src("electron/main.ts")
    .pipe(rollup(rollupOptions, "cjs"))
    .pipe(rename("main.js"))
    .pipe(gulp.dest("./dist"));
});

gulp.task("electron:preload", function() {
  const rollupOptions = {
    external: ["electron"],
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        target: "esnext",
        module: "ESNext"
      })
    ]
  };

  return gulp
    .src("electron/preload.ts")
    .pipe(rollup(rollupOptions, "cjs"))
    .pipe(rename("preload.js"))
    .pipe(gulp.dest("./dist"));
});

gulp.task("electron:renderer", function(cb) {
  const options = {
    autoinstall: false,
    cache: true,
    hmr: false,
    logLevel: 3,
    minify: true,
    outDir: path.join(__dirname, "./dist"),
    publicUrl: "./",
    sourceMaps: true,
    watch: false,
    //scopeHoist: true
  };

  const entryPoints = ["static/index.html"];

  const bundler = new Bundler(entryPoints, options);
  bundler.on("bundled", () => cb());
  bundler.bundle();
});

gulp.task(
  "electron",
  gulp.parallel("electron:preload", "electron:main", "electron:renderer")
);

gulp.task(
  "modules:slye",
  gulp.parallel(function SlyeModuleMain() {
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
        "@slye/core": "slye"
      }
    };

    return gulp
      .src("modules/slye/main.ts")
      .pipe(rollup(rollupOptions, outputOptions))
      .pipe(rename("main.js"))
      .pipe(gulp.dest("./dist/modules/slye"));
  }, function SlyeModuleAssets() {
    return gulp.src('modules/slye/assets/**')
      .pipe(gulp.dest('./dist/modules/slye/assets'));
  })
);

gulp.task("modules", gulp.parallel("modules:slye"));

exports.default = gulp.parallel("electron", "modules");
