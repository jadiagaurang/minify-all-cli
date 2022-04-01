#! /usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const peach = require("parallel-each");
const winston = require("./logger").winston;
const AppUtil = require("./apputil.js");
const UglifyJS = require("uglify-js");
const PostCSS = require("postcss");
const CSSNano = require("cssnano");
const HTMLMinifier = require("html-minifier").minify;

module.exports = class MinifyAllCLI {
  defaultOptions = {
    skipJS: false,
    skipCSS: false,
    skipHTML: false,
    doGzip: false,
    skipFileMasks: "",
    ignoreFileMasks: "",
    configFile: null,
    logLevel: "info",
    processCount: 10
  }

  constructor(strSourceDirectory, strDestinationDirectory, options) {
    var me = this;

    me.SourceDirectory = strSourceDirectory;
    me.DestinationDirectory = strDestinationDirectory;
    me.options = _.extend({}, me.defaultOptions, options);
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

    this.logger.info("me.SourceDirectory: " + me.SourceDirectory);
    this.logger.info("me.DestinationDirectory: " + me.DestinationDirectory);

    // Collect all the files to loop through!
    // TODO: May use globby or fast-glob to manage better file-masking in future!
    let arrayAllFiles = AppUtil.getAllFiles(me.SourceDirectory);

    let processedFiles = 0;
    peach(arrayAllFiles, async (strFilePath, index) => {
        if (!me.options.skipJS && strFilePath.endsWith(".js") && !strFilePath.endsWith(".min.js")) {
         this.minifyJS(strFilePath, index);
        }
        else if (!me.options.skipCSS && strFilePath.endsWith(".css") && !strFilePath.endsWith(".min.css")) {
          this.minifyCSS(strFilePath, index);
        }
        else if (!me.options.skipHTML && strFilePath.endsWith(".html") && !strFilePath.endsWith(".min.html")) {
          this.minifyHTML(strFilePath, index);
         }
        else {
          await this.gzip(strFilePath, index);
        }
        
        processedFiles++;
    }, me.options.processCount).then(() => {
        this.logger.info("Total Files: " + arrayAllFiles.length + "; Processed Files: " + processedFiles);
    });
  }

  minifyJS = (strFilePath, index) => new Promise((resolve) => {
    var me = this;

    setTimeout(() => {
      if (!me.options.skipJS && strFilePath.endsWith(".js") && !strFilePath.endsWith(".min.js")) {
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
            resolve();
          });
        }
        else {
          me.logger.error(result.error);

          fs.writeFile(strDestinationFile, code, (err) => {
            if (err) me.logger.error(err);  //throw err;

            me.logger.warn("Skip. Path: " + strDestinationFile);
            resolve();
          });
        }
      }
    }, 100);
  });

  minifyCSS = (strFilePath, index) => new Promise((resolve) => {
    var me = this;

    setTimeout(() => {
      var strPartialFilePath = strFilePath.replace(me.SourceDirectory, "");
      var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath);
      
      var css = fs.readFileSync(strFilePath, "utf8");

      PostCSS([CSSNano({ preset: "cssnano-preset-default" })])
        .process(css, { from: undefined, to: undefined })
        .then(result => {
          fs.writeFile(strDestinationFile, result.css, (err) => {
            if (err) me.logger.error(err);  //throw err;

            me.logger.info("CSS.  Path: " + strDestinationFile);
          });
      });
    }, 100);
  });

  minifyHTML = (strFilePath, index) => new Promise((resolve) => {
    var me = this;

    setTimeout(() => {
      var strPartialFilePath = strFilePath.replace(me.SourceDirectory, "");
      var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath);

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
    }, 100);
  });

  gzip = (strFilePath, index) => new Promise((resolve) => {
    var me = this;

    setTimeout(() => {
      var strPartialFilePath = strFilePath.replace(me.SourceDirectory, "");
      var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath); //strFilePath.replace(me.SourceDirectory, me.DestinationDirectory);
      var strFileDirectory = path.dirname(strDestinationFile);
        
      fs.mkdirSync(strFileDirectory, { recursive: true });
      
      if (me.options.doGzip) {
        AppUtil.doGzip(strFilePath, strDestinationFile).then(function () {
          me.logger.info("Gzip. Source: " + strFilePath + "; Destination: " + strDestinationFile);
          resolve();
        })
        .catch((err) => {
          if (err) me.logger.error(err);  //throw err;

          fs.copyFile(strFilePath, strDestinationFile, (err) => {
            if (err) me.logger.error(err);  //throw err;

            me.logger.warn("Skip. Source: " + strFilePath + "; Destination: " + strDestinationFile);
            resolve();
          });
        });
      }
      else {
        fs.copyFile(strFilePath, strDestinationFile, (err) => {
          if (err) me.logger.error(err);  //throw err;

          me.logger.warn("Skip. Source: " + strFilePath + "; Destination: " + strDestinationFile);
          resolve();
        });
      }
    }, 1000);
  });
}