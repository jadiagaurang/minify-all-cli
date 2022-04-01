#! /usr/bin/env node

//"use strict";

const fs = require("fs");
const path = require("path");
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { createReadStream, createWriteStream } = require("fs");
const { promisify } = require("util");
const pipe = promisify(pipeline);

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    }
    else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  })

  return arrayOfFiles;
}

async function doGzip(input, output) {
  const gzip = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);
  await pipe(source, gzip, destination);
}

module.exports = {
    "doGzip": doGzip,
    "getAllFiles": getAllFiles
};