const electronPackager = require("electron-packager");
const path = require("path");

const electronPackagerOptions = {
  name: "Slye",
  dir: path.join(__dirname, ".."),
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

function packager(platform, arch) {
  return function(cb) {
    electronPackager({
      ...electronPackagerOptions,
      platform,
      arch
    }).then(data => {
      console.log("Wrote " + platform + "-" + arch + " package to " + data[0]);
      cb();
    });
  };
}

module.exports = packager;
