const gulp = require("gulp");
const path = require("path");
const rollup = require("./gulpfile/rollup");
const parcel = require("./gulpfile/parcel");
const slyeModule = require("./gulpfile/module");
const packager = require("./gulpfile/packager");
const rm = require("./gulpfile/rm");
const serve = require("./gulpfile/server");
const tester = require("./gulpfile/tester");
const deploy = require("./gulpfile/deploy");

// Cleanup script
gulp.task("clean", rm("dist"));

// Modules
gulp.task("modules:slye", slyeModule("slye"));
gulp.task("modules", gulp.parallel("modules:slye"));

// Electron
gulp.task("electron:main", rollup("electron/main.ts", "main.js"));

gulp.task(
  "electron:preload",
  rollup("electron/preload.ts", "preload.js", {
    external: ["electron"]
  })
);

gulp.task(
  "electron:renderer",
  parcel("electron/static/index.html", {
    external: ["electron"]
  })
);

gulp.task("electron:icons", function() {
  return gulp.src("icons/*").pipe(gulp.dest("./dist/icons"));
});

gulp.task(
  "electron",
  gulp.parallel(
    "electron:main",
    "electron:preload",
    "electron:icons",
    "electron:renderer"
  )
);

// Electron Binary Packages
gulp.task("package:win32", packager("win32", "ia32"));
gulp.task("package:linux64", packager("linux", "x64"));

// Web
gulp.task("website", parcel("website/index.html"));
gulp.task("webapp", parcel("web/app.html"));
gulp.task("web", gulp.series("website", "webapp"));

// Build Targets
gulp.task("build:electron", gulp.series("clean", "modules", "electron"));
gulp.task("build:web", gulp.series("clean", "modules", "web"));

// Binary Releases
gulp.task(
  "binary:all",
  gulp.series(
    "build:electron",
    gulp.parallel("package:win32", "package:linux64")
  )
);

// GitHub deploy
gulp.task("deploy", gulp.series("build:web", deploy("dist")));

// Internal Static Server
gulp.task("serve", serve("./dist", 8080));

// Unit Testing
gulp.task("test:bundle", parcel("tests/test.html", { minify: false }));
gulp.task("test:run", tester("http://localhost:8080/test.html"));
gulp.task("test", gulp.series("serve", "test:bundle", "test:run"));

exports.default = gulp.parallel("build:electron");
