const Bundler = require("parcel-bundler");
const path = require("path");

function parcel(entryPoint, opts) {
  return function(cb) {
    const options = {
      autoinstall: false,
      cache: true,
      hmr: false,
      logLevel: 3,
      minify: true,
      outDir: path.join(__dirname, "..", "./dist"),
      publicUrl: "./",
      sourceMaps: true,
      watch: false,
      ...opts
    };

    const entryPoints = [entryPoint];

    const bundler = new Bundler(entryPoints, options);
    bundler.on("bundled", () => cb());
    bundler.bundle();
  };
}

module.exports = parcel;
