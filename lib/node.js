#! /usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");

const AppUtil = require("./apputil.js");
const UglifyJS = require("uglify-js");
const PostCSS = require("postcss");
const CSSNano = require("cssnano");

var defaultOptions = {
  skipJS: false,
  skipCSS: false,
  skipHTML: false,
  skipFileMasks: "",
  ignoreFileMasks: "",
  configFile: null,
  verbose: true,
  logLevel: "info"
};

module.exports = class MinifyAllCLI {
  constructor(strSourceDirectory, strDestinationDirectory, options) {
    var me = this;
    me.SourceDirectory = strSourceDirectory;
    me.DestinationDirectory = strDestinationDirectory;
    me.options = _.extend({}, defaultOptions, options);
  }

  doCompression() {
    var me = this;

    // Validate Source Directory
    if (!fs.existsSync(me.SourceDirectory)) {
      throw "SourceDirectory doesn't exists!";
    }
    
    // Validate Destination Directory and delete if already exists
    if (fs.existsSync(me.DestinationDirectory)) {
      fs.rmSync(me.DestinationDirectory, { recursive: true });
    }
    
    // Collect all the files to loop through!
    // TODO: May use globby or fast-glob to manage better file-masking in future!
    let arrayAllFiles = AppUtil.getAllFiles(me.SourceDirectory);

    arrayAllFiles.forEach(strFilePath => {
        var strDestinationFile = strFilePath.replace(me.SourceDirectory, me.DestinationDirectory);
        var strFileDirectory = path.dirname(strDestinationFile);

        fs.mkdirSync(strFileDirectory, { recursive: true });

        if (strFilePath.endsWith(".js") && !strFilePath.endsWith(".min.js")) {
          var code = fs.readFileSync(strFilePath, "utf8");

          var uglifyConfiguration = me.options.configFile ? require(path.resolve(me.options.configFile)) : {};

          var uglifyOptions = {
            "compress": true,
            "mangle": {
              "reserved": [
                "$",
                "jQuery",
                "_",
                "Backbone"
              ]
            },
            "keep_fnames": false,
            "toplevel": true
          };

          uglifyOptions = _.extend({}, uglifyOptions, uglifyConfiguration);
          var result = UglifyJS.minify(code, uglifyOptions);

          if (!result.error) {
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
        else if (strFilePath.endsWith(".css") && !strFilePath.endsWith(".min.css")) {
          var code = fs.readFileSync(strFilePath, "utf8");

          PostCSS([CSSNano({ preset: "cssnano-preset-default" })])
            .process(code, { from: undefined, to: undefined })
            .then(result => {
              fs.writeFile(strDestinationFile, result.css, (err) => {
                if (err) console.error(err);  //throw err;
  
                console.log("CSS Compressed. Path: " + strDestinationFile);
              });
          });
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