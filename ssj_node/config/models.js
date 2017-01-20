var recordModel = require('../app/models/record');

var orm      = require('orm');
var mysql      = require('mysql');
var settings = require('./settings');
var connection = null;

function setupModels(db, cb) {
    recordModel(orm,db);
    
    return cb(null, db);
}

function createConnection(cb) {
    if (connection) return cb(null, connection);

    orm.connect(settings.database, function (err, db) {
        if (err) return cb(err);

        connection = db;
        db.settings.set('instance.returnAllErrors', true);
        db.settings.set('properties.primary_key', "Id");

        setupModels(db, cb);

    });
};

module.exports = function (app, runingtaskscript) {
    if( !!runingtaskscript ){
        app = typeof app == 'function'? app:function() {};
        createConnection(app);
    }else{
        app.use(function (req, res, next) {

            var frontAsset = req.url.match(/(.html|.js|.css|.png|.jepg|.gif)$/);
            var isFrontAsset = false;
            if( frontAsset && frontAsset.length ){
                isFrontAsset = true;
                // 静态资源不要建立DB连接
                return next();
            }

            createConnection(function (err, db) {
                if (err) return next(err);

                req.models = db.models;
                req.db     = db;

                return next();
            });
        });
    }
}
