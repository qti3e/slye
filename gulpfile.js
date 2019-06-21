const gulp = require("gulp");
const path = require("path");

const Bundler = require("parcel-bundler");
const rollup = require("gulp-better-rollup");
const rename = require("gulp-rename");
const packager = require("electron-packager");
const mergeStream = require("merge-stream");

const typescript = require("rollup-plugin-typescript");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");

const electronPackagerOptions = {
  name: "Slye",
  dir: __dirname,
  "app-copyright": "Parsa Ghadimi",
  out: "release",
  version: "0.0.1",
  overwrite: true,
  win32metadata: {
    CompanyName: "Slye",
    FileDescription: "Slye",
    OriginalFilename: "Slye",
    ProductName: "Slye",
    InternalName: "Slye"
  },
  ignore: file => {
    if (!file) return false;
    if (file.startsWith("/dist")) return false;
    if (file.startsWith("/node_modules/@slye")) return true;
    if (file.startsWith("/node_modules")) return false;
    if (file === "/package.json") return false;
    return true;
  }
};

const uglifyes = require("uglify-es");
const composer = require("gulp-uglify/composer");
const minify = composer(uglifyes, console);

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
    ]
  };

  const main = gulp
    .src("electron/main.ts")
    .pipe(rollup(rollupOptions, "cjs"))
    .pipe(minify())
    .pipe(rename("main.js"))
    .pipe(gulp.dest("./dist"));

  const icons = gulp.src("icons/*").pipe(gulp.dest("./dist/icons"));

  return mergeStream(main, icons);
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
    .pipe(minify())
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
    watch: false
    //scopeHoist: true
  };

  const entryPoints = ["electron/static/index.html"];

  const bundler = new Bundler(entryPoints, options);
  bundler.on("bundled", () => cb());
  bundler.bundle();
});

gulp.task(
  "electron",
  gulp.parallel("electron:preload", "electron:main", "electron:renderer")
);

gulp.task("modules:slye", function() {
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
    .src("modules/slye/main.ts")
    .pipe(rollup(rollupOptions, outputOptions))
    .pipe(minify())
    .pipe(rename("main.js"))
    .pipe(gulp.dest("./dist/modules/slye"));

  const assets = gulp
    .src("modules/slye/assets/**")
    .pipe(gulp.dest("./dist/modules/slye/assets"));

  return mergeStream(jsStream, assets);
});

gulp.task("modules", gulp.parallel("modules:slye"));

gulp.task("web:frontend", function(cb) {
  const options = {
    autoinstall: false,
    cache: true,
    hmr: false,
    logLevel: 3,
    minify: true,
    outDir: path.join(__dirname, "./dist"),
    publicUrl: "./",
    sourceMaps: true,
    watch: false
    //scopeHoist: true
  };

  const entryPoints = ["web/app.html"];

  const bundler = new Bundler(entryPoints, options);
  bundler.on("bundled", () => cb());
  bundler.bundle();
});

gulp.task("web", gulp.parallel("modules", "web:frontend"));

gulp.task("release:linux64", function(cb) {
  packager({
    ...electronPackagerOptions,
    platform: "linux",
    arch: "x64"
  }).then(data => {
    console.log("Wrote Linux X64 app to " + data[0]);
    cb();
  });
});

gulp.task("release:win32", function(cb) {
  packager({
    ...electronPackagerOptions,
    platform: "win32",
    arch: "ia32"
  }).then(data => {
    console.log("Wrote Win X64 app to " + data[0]);
    cb();
  });
});

gulp.task("release:all", gulp.series("release:linux64", "release:win32"));

exports.default = gulp.parallel("electron", "modules");
