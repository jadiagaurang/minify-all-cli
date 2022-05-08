#! /usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const peach = require("parallel-each");
const zlib = require("zlib");
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
    skipFileMasks: [],
    skipFileExtensions: [".mp3", ".mp4"],
    ignoreFileMasks: [],
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

    // Check Source Directory is Absolute; if not then convert to absolute
    if(!path.isAbsolute(me.SourceDirectory)) {
      me.SourceDirectory = path.resolve(me.SourceDirectory);
    }
    // Validate Source Directory
    if (!fs.existsSync(me.SourceDirectory)) {
      throw new Error("SourceDirectory doesn't exists!");
    }

    // Check Destination Directory is Absolute; if not then convert to absolute
    if(!path.isAbsolute(me.DestinationDirectory)) {
      me.DestinationDirectory = path.resolve(me.DestinationDirectory);
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
        var strPartialFilePath = path.relative(me.SourceDirectory, strFilePath);
        var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath);
        var strFileDirectory = path.dirname(strDestinationFile);
        
        fs.mkdirSync(strFileDirectory, { recursive: true });

        var code = fs.readFileSync(strFilePath, "utf8");

        var uglifyConfiguration = !AppUtil.isBlank(me.options.configFile) ? require(path.resolve(me.options.configFile)) : {};
        
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
          let strCode = result.code;

          if (me.options.doGzip) {
            const bufJS = new Buffer.from(strCode, "utf-8");
            zlib.gzip(bufJS, function (_, strGzipResult) {
              fs.writeFile(strDestinationFile, strGzipResult, (err) => {
                if (err) me.logger.error(err);

                me.logger.info("JS.   Path: " + strDestinationFile);
                resolve();
              });
            });
          }
          else {
            fs.writeFile(strDestinationFile, strCode, (err) => {
              if (err) me.logger.error(err);

              me.logger.info("JS.   Path: " + strDestinationFile);
              resolve();
            });
          }
        }
        else {
          me.logger.error(result.error);

          fs.writeFile(strDestinationFile, code, (err) => {
            if (err) me.logger.error(err);

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
      var strPartialFilePath = path.relative(me.SourceDirectory, strFilePath);
      var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath);
      var strFileDirectory = path.dirname(strDestinationFile);
        
      fs.mkdirSync(strFileDirectory, { recursive: true });
      
      var css = fs.readFileSync(strFilePath, "utf8");

      PostCSS([CSSNano({ preset: "cssnano-preset-default" })])
        .process(css, { from: undefined, to: undefined })
        .then(result => {
          let strCode = result.css;

          if (me.options.doGzip) {
            const bufJS = new Buffer.from(strCode, "utf-8");
            zlib.gzip(bufJS, function (_, strGzipResult) {
              fs.writeFile(strDestinationFile, strGzipResult, (err) => {
                if (err) me.logger.error(err);

                me.logger.info("CSS.  Path: " + strDestinationFile);
                resolve();
              });
            });
          }
          else {
            fs.writeFile(strDestinationFile, strCode, (err) => {
              if (err) me.logger.error(err);

              me.logger.info("CSS.  Path: " + strDestinationFile);
              resolve();
            });
          }
      });
    }, 100);
  });

  minifyHTML = (strFilePath, index) => new Promise((resolve) => {
    var me = this;

    setTimeout(() => {
      var strPartialFilePath = path.relative(me.SourceDirectory, strFilePath);
      var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath);
      var strFileDirectory = path.dirname(strDestinationFile);
        
      fs.mkdirSync(strFileDirectory, { recursive: true });

      var html = fs.readFileSync(strFilePath, "utf8");

      let strCode = HTMLMinifier(html, {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeOptionalTags: true,
        removeTagWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        useShortDoctype: true
      });
      
      if (me.options.doGzip) {
        const bufJS = new Buffer.from(strCode, "utf-8");
        zlib.gzip(bufJS, function (_, strGzipResult) {
          fs.writeFile(strDestinationFile, strGzipResult, (err) => {
            if (err) me.logger.error(err);

            me.logger.info("HTML. Path: " + strDestinationFile);
            resolve();
          });
        });
      }
      else {
        fs.writeFile(strDestinationFile, strCode, (err) => {
          if (err) me.logger.error(err);

          me.logger.info("HTML. Path: " + strDestinationFile);
          resolve();
        });
      }
    }, 100);
  });

  gzip = (strFilePath, index) => new Promise((resolve) => {
    var me = this;

    setTimeout(() => {
      var strPartialFilePath = path.relative(me.SourceDirectory, strFilePath);
      var strDestinationFile = path.join(me.DestinationDirectory, path.sep, strPartialFilePath);
      var strFileDirectory = path.dirname(strDestinationFile);
      var strFileExtension = path.extname(strFilePath);
      
      fs.mkdirSync(strFileDirectory, { recursive: true });
      
      if (me.options.doGzip && !_.contains(me.options.skipFileExtensions, strFileExtension)) {
        AppUtil.doGzip(strFilePath, strDestinationFile).then(function () {
          me.logger.info("Gzip. Source: " + strFilePath + "; Destination: " + strDestinationFile);
          resolve();
        })
        .catch((err) => {
          if (err) me.logger.error(err);

          fs.copyFile(strFilePath, strDestinationFile, (err) => {
            if (err) me.logger.error(err);

            me.logger.warn("Skip. Source: " + strFilePath + "; Destination: " + strDestinationFile);
            resolve();
          });
        });
      }
      else {
        fs.copyFile(strFilePath, strDestinationFile, (err) => {
          if (err) me.logger.error(err);

          me.logger.warn("Skip. Source: " + strFilePath + "; Destination: " + strDestinationFile);
          resolve();
        });
      }
    }, 1000);
  });
}