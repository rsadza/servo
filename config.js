'use strict';

var path = process.env.SERVO_CONFIG || process.argv[2];
module.exports = require(require('path').resolve(path));