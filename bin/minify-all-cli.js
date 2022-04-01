#! /usr/bin/env node

"use strict";

const yargs = require("yargs");
var MinifyAllCLI = require("../lib/node.js");

const cliOptions = yargs
 .usage("Usage: -s <source> -d <destination>")
 .option("j", { alias: "skipJS", describe: "Should minify JS the file or skip it?", type: "boolean", demandOption: false })
 .option("c", { alias: "skipCSS", describe: "Should minify CSS the file or skip it?", type: "boolean", demandOption: false })
 .option("h", { alias: "skipHTML", describe: "Should minify HTML the file or skip it?", type: "boolean", demandOption: false })
 .option("g", { alias: "doGzip", describe: "Should gzip the file or skip it?", type: "boolean", demandOption: false })
 .option("m", { alias: "skipFileMasks", describe: "Partial Filder Path to skip it over", type: "string", demandOption: false })
 .option("i", { alias: "ignoreFileMasks", describe: "Partial Filder Path to ignore it over", type: "string", demandOption: false })
 .option("f", { alias: "configFile", describe: "Specifies a json configuration file for the UglifyJS, CSSNano and HTML Minifier module", type: "string", demandOption: false })
 .option("l", { alias: "logLevel", describe: "Set log level to print warn, log, error, fatal messages", type: "string", demandOption: false })
 .option("p", { alias: "processCount", describe: "Specifies process count to set maximum degree of parallelism", type: "number", demandOption: false })
 .argv;
 
 var options = {
    skipJS: cliOptions.skipJS || cliOptions.j || false,
    skipCSS: cliOptions.skipCSS || cliOptions.c || false,
    skipHTML: cliOptions.skipHTML || cliOptions.h || false,
    doGzip: cliOptions.doGzip || cliOptions.g || false,
    skipFileMasks: cliOptions.skipFileMasks || cliOptions.m || "",
    ignoreFileMasks: cliOptions.ignoreFileMasks || cliOptions.i || "",
    configFile: cliOptions.configFile || cliOptions.f || null,
    logLevel: cliOptions.logLevel || cliOptions.l || "info",
    processCount: cliOptions.processCount || cliOptions.p || 10
 };
 var objMinifyAll = new MinifyAllCLI(cliOptions.s, cliOptions.d, options);
 objMinifyAll.process();