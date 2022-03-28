#! /usr/bin/env node

"use strict";

const yargs = require("yargs");
var MinifyAllCLI = require("../lib/node.js");

const options = yargs
 .usage("Usage: -s <source> -d <destination>")
 .option("j", { alias: "skip-js", describe: "Should minify JS the file or skip it?", type: "boolean", demandOption: false })
 .option("c", { alias: "skip-css", describe: "Should minify CSS the file or skip it?", type: "boolean", demandOption: false })
 .option("h", { alias: "skip-html", describe: "Should minify HTML the file or skip it?", type: "boolean", demandOption: false })
 .option("m", { alias: "file-mask-skip", describe: "Partial Filder Path to skip it over", type: "string", demandOption: false })
 .option("i", { alias: "file-mask-ignore", describe: "Partial Filder Path to ignore it over", type: "string", demandOption: false })
 .option("v", { alias: "verbose", describe: "Set output to verbose messages.", type: "string", demandOption: false })
 .option("l", { alias: "log-level", describe: "Set log level to print warn, log, error, fatal messages", type: "string", demandOption: false })
 .argv;
 
 var objMinifyAll = new MinifyAllCLI(options.s, options.d);    //TODO: Other Args!
 objMinifyAll.doCompression();