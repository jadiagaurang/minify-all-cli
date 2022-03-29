#! /usr/bin/env node

"use strict";

const winston = require("winston");

const createLogger = function(logLevel) {
    const logger = winston.createLogger({
        level: logLevel,
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple()
        )
    });
    
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));

    return logger;
};

module.exports = {
    "winston": createLogger
};