const gulp = require("gulp");
const path = require("path");

const Bundler = require("parcel-bundler");
const rollup = require("gulp-better-rollup");
const rename = require("gulp-rename");
const packager = require("electron-packager");
const mergeStream = require("merge-stream");
const ghpages = require("gh-pages");
const del = require("del");

const typescript = require("rollup-plugin-typescript");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");

const fs = require("fs");
const http = require("http");
const url = require("url");
const mime = require("mime");
const puppeteer = require("puppeteer");

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

gulp.task("clean", function(cb) {
  del.sync(["dist"]);
  cb();
});

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

gulp.task("web", gulp.parallel("clean", "modules", "web:frontend"));

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

gulp.task("deploy", cb =>
  ghpages.publish("dist", err => {
    if (err) console.log(err);
    cb();
  })
);

gulp.task("serve", cb => {
  const basePath = path.join(__dirname, "./dist");
  const index = path.join(basePath, "index.html");

  const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    const filePath = path.join(basePath, reqUrl.pathname);
    if (!filePath.startsWith(basePath)) {
      res.writeHead(403, { "Content-Type": "text/html; charset=utf-8" });
      res.end("Access denied.");
      return;
    }
    fs.stat(filePath, (err, stat) => {
      let finalPath = filePath;
      if ((err && err.code === "ENOENT") || stat.isDirectory()) {
        finalPath = index;
      } else if (err) {
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`Unexpected server error occurred. [#${err.code}]`);
        return;
      }
      if (!fs.existsSync(finalPath)) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("Not Found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime.getType(finalPath) });
      const stream = fs.createReadStream(finalPath);
      stream.pipe(res);
    });
  });

  server.listen(8080, () => {
    cb();
    console.log(`Server started listening on port ${8080}...`);
  });
});

gulp.task("test:build", function(cb) {
  const options = {
    autoinstall: false,
    cache: true,
    hmr: false,
    logLevel: 3,
    minify: false,
    outDir: path.join(__dirname, "./dist"),
    publicUrl: "./",
    sourceMaps: true,
    watch: false
  };

  const entryPoints = ["tests/test.html"];

  const bundler = new Bundler(entryPoints, options);
  bundler.on("bundled", () => cb());
  bundler.bundle();
});

gulp.task("test:run", async function(cb) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:8080/test.html");

  page.on("console", async msg => {
    const text = msg.text();
    const args = [];
    for (let i = 0; i < msg.args().length; ++i) {
      args.push(await msg.args()[i].jsonValue());
    }
    console.log(...args);
    if (text.indexOf("DONE. Test passed") > -1) {
      await browser.close();
      const index = text.lastIndexOf(" ");
      const n = Number(text.substr(index + 1));
      process.exit(n > 0 ? 1 : 0);
    }
  });
});

gulp.task("test", gulp.series("serve", "test:build", "test:run"));

exports.default = gulp.parallel("clean", "electron", "modules");
