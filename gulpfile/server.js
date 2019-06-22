const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");
const mime = require("mime");

function httpServer(dir = "./dist", port = 8080) {
  return function(cb) {
    const basePath = path.join(__dirname, "..", dir);
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

    server.listen(port, () => {
      cb();
      console.log(`Server started listening on port ${port}...`);
    });
  };
}

module.exports = httpServer;
