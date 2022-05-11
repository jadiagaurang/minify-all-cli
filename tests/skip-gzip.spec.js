#! /usr/bin/env node

"use strict";

const expect = require("chai").expect;
const cmd = require("./cli");
const AppUtil = require("../lib/apputil.js");

describe("minify-all-cli", () => {
    it("minify-all-cli with gzip false options", async () => {
        const response = await cmd.execute(
            "./bin/minify-all-cli.js", [
                "-s", "./tests/asserts", 
                "-d", "./tests/asserts_compressed", 
                "--doGzip=false", 
                "--logLevel=info"
            ]
        );
        
        // Print the standard output stream response
        console.log(response);

        var arrayAllFiles = AppUtil.getAllFiles("./tests/asserts");
        var arrayProcessedFiles = AppUtil.getAllFiles("./tests/asserts_compressed");

        expect(arrayAllFiles.length).to.equal(arrayProcessedFiles.length);
    });
});
