'use strict';

var _ = require('underscore');
var config = require('../config');
var executeGmRoutine = require('./execute-gm-routine');

module.exports = function(req, res, next) {
    var s3 = req.app.s3;
    var key = config.bucketKeyPrefix + req.path.slice(config.pathPrefix.length);

    var routineKey = req.query.format;
    var routine = config.routines[routineKey];

    var badRoutine = routineKey != null && !routine;

    if (badRoutine) {
        return next(404);
    }
    
    s3.getObject({
        Bucket: config.bucket,
        Key: key
    }, function(er, data) {
        if (er) {
            return next(er.name === 'NoSuchKey' ? 404 : er);
        }

        if (data.ContentType.indexOf('image') !== 0 || !routine) {
            return res.set(config.headers)
                .contentType(data.ContentType)
                .send(data.Body);
        }

        executeGmRoutine(data.Body, routine, function(er, image) {
            if (er) {
                return next(er);
            }
            return res.set(config.headers)
                .contentType(data.ContentType)
                .send(image);
        });
    });
};
