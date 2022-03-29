#! /usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");

const winston = require('./logger').winston;
const AppUtil = require("./apputil.js");
const UglifyJS = require("uglify-js");
const PostCSS = require("postcss");
const CSSNano = require("cssnano");
const HTMLMinifier = require("html-minifier").minify;

var defaultOptions = {
  skipJS: false,
  skipCSS: false,
  skipHTML: false,
  skipFileMasks: "",
  ignoreFileMasks: "",
  configFile: null,
  logLevel: "info"
};

module.exports = class MinifyAllCLI {
  constructor(strSourceDirectory, strDestinationDirectory, options) {
    var me = this;
    me.SourceDirectory = strSourceDirectory;
    me.DestinationDirectory = strDestinationDirectory;
    me.options = _.extend({}, defaultOptions, options);
    me.logger = winston(me.options.logLevel);
  }

  process() {
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

        if (!me.options.skipJS && 
          strFilePath.endsWith(".js") && 
          !strFilePath.endsWith(".min.js")) {
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
              if (err) me.logger.error(err);  //throw err;

              me.logger.info("JS.   Path: " + strDestinationFile);
            });
          }
          else {
            me.logger.error(result.error);

            fs.writeFile(strDestinationFile, code, (err) => {
              if (err) me.logger.error(err);  //throw err;

              me.logger.warn("Skip. Path: " + strDestinationFile);
            });
          }
        }
        else if (!me.options.skipCSS && 
          strFilePath.endsWith(".css") && 
          !strFilePath.endsWith(".min.css")) {
          var css = fs.readFileSync(strFilePath, "utf8");

          PostCSS([CSSNano({ preset: "cssnano-preset-default" })])
            .process(css, { from: undefined, to: undefined })
            .then(result => {
              fs.writeFile(strDestinationFile, result.css, (err) => {
                if (err) me.logger.error(err);  //throw err;
  
                me.logger.info("CSS.  Path: " + strDestinationFile);
              });
          });
        }
        else if (!me.options.skipHTML && 
          strFilePath.endsWith(".html") && 
          !strFilePath.endsWith(".min.html")) {
          var html = fs.readFileSync(strFilePath, "utf8");

          var result = HTMLMinifier(html, {
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeOptionalTags: true,
            removeTagWhitespace: true,
            minifyJS: true,
            minifyCSS: true,
            useShortDoctype: true
          });

          fs.writeFile(strDestinationFile, result, (err) => {
            if (err) me.logger.error(err);  //throw err;

            me.logger.info("HTML. Path: " + strDestinationFile);
          });
        }
        else {
          fs.copyFile(strFilePath, strDestinationFile, (err) => {
            if (err) me.logger.error(err);  //throw err;

            me.logger.warn("Skip. Path: " + strDestinationFile);
          });
        }
    });
  }
}