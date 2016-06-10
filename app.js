'use strict';

var _ = require('underscore');
var config = require('./config');
var express = require('express');
var AWS = require('aws-sdk');

var app = express();

app.s3 = new AWS.S3({apiVersion: config.apiVersion});

// Don't waste bytes on an extra header.
app.disable('x-powered-by');

// Helpful vendor middleware.
app.use(express.compress());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());

// Requests should be in the form /path/to/image(-job-name)(.extension)
app.get(
    config.pathPrefix + '*',
    require('./lib/check-user-agent'),
    require('./lib/read-file')
);

// Ensure bad responses aren't cached.
app.use(require('./lib/handle-error'));

// Start listening for requests.
var server = app.listen(config.port);

module.exports = server;