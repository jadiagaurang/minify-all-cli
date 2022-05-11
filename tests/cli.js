#! /usr/bin/env node

"use strict";

const spawn = require("child_process").spawn;
const concat = require("concat-stream");

const createProcess = function (processPath, args = []) {
    args = [processPath].concat(args);
    return spawn("node", args);
}

const execute = function (processPath, args = [], opts = {}) {
    const { env = null } = opts;
    const childProcess = createProcess(processPath, args, env);
    childProcess.stdin.setEncoding("utf-8");
    const promise = new Promise((resolve, reject) => {
        childProcess.stderr.once("data", err => {
            reject(err.toString());
        });
        childProcess.on("error", reject);
        childProcess.stdout.pipe(
            concat(result => {
                resolve(result.toString());
            })
        );
    });
    
    return promise;
}

module.exports = { execute };