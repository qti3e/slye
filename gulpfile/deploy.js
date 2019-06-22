const ghpages = require("gh-pages");

function deploy(dir) {
  return function(cb) {
    ghpages.publish(dir, err => {
      if (err) {
        console.error(err);
        process.exit(-1);
        return;
      }
      cb();
    });
  };
}

module.exports = deploy;
