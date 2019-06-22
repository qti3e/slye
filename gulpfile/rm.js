const gulp = require("gulp");
const del = require("del");

function rm(dir) {
  return function(cb) {
    del.sync([dir]);
    cb();
  };
}

module.exports = rm;
