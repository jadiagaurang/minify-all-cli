#! /usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

var AppUtil = require("../lib/util.js");
var UglifyJS = require("uglify-js");

module.exports = class MinifyAllCLI {
  constructor(strSourceDirectory, strDestinationDirectory) {
    this.SourceDirectory = strSourceDirectory;
    this.DestinationDirectory = strDestinationDirectory;
  }

  doCompression() {
    if (!fs.existsSync(this.SourceDirectory)) {
      throw "SourceDirectory doesn't exists!";
    }
    
    if (fs.existsSync(this.DestinationDirectory)) {
      fs.rmdir(this.DestinationDirectory, { recursive: true }, (err) => {
        if (err) console.error(err);  //throw err;
      });
    }
    
    let arrayAllFiles = AppUtil.getAllFiles(this.SourceDirectory);

    arrayAllFiles.forEach(strFilePath => {
        var strDestinationFile = strFilePath.replace(this.SourceDirectory, this.DestinationDirectory);
        var strFileDirectory = path.dirname(strDestinationFile);

        fs.mkdir(strFileDirectory, { recursive: true }, (err) => {
          if (err) console.error(err);  //throw err;
        });

        if (strFilePath.endsWith(".js") && 
            !strFilePath.endsWith(".min.js")) {
              
          var code = fs.readFileSync(strFilePath, "utf8");

          var options = { 
            compress: true,
            mangle: {
              toplevel: true
            },
            toplevel: true
          };

          var result = UglifyJS.minify(code, options);

          if (result.error == null || result.error == "") {
            fs.writeFile(strDestinationFile, result.code, (err) => {
              if (err) console.error(err);  //throw err;

              console.log("JS Compressed. Path: " + strDestinationFile);
            });
          }
          else {
            console.error("JS Minify Error:" + "\r\n" + result.error);
            fs.writeFile(strDestinationFile, code, (err) => {
              if (err) console.error(err);  //throw err;

              console.log("JS Skipped. Path: " + strDestinationFile);
            });
          }
        }
        else {
          fs.copyFile(strFilePath, strDestinationFile, (err) => {
            if (err) console.error(err);  //throw err;

            console.log("Skipped. Path: " + strDestinationFile);
          });
        }
    });
  }
}