var path     = require('path');
var express  = require('express');
var settings = require('./settings');

var cookieParser = require('cookie-parser');
// var cookieSign = require('cookie-signature');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var csrf = require('csurf');

var utils = require( '../utils/utils' );

var environment = {
    initialize:function(app){
        this.baseEnv(app);
        this.secureEnv(app);
    },

    baseEnv:function(app){
        app.set('views', path.join(__dirname, '../app/views'));
        app.set('view engine', 'jade');

        app.use(cookieParser());

        app.use(express.static(path.join(settings.path, 'public')));

        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
       
        app.use(session({
            secret: 'kenshin niu',
            resave: false,
            name: 'connect.sid',
            saveUninitialized: true
        }));
    },

    secureEnv:function(app){
        //写成一个midleware
        app.use(function( req, res, next ){
            var doLogin = false;

            if( req.url.indexOf('/user/login') > -1 ){
                doLogin = true;
            }

            var frontAsset = req.url.match(/(.html|.js|.css|.png|.jepg|.gif)$/);
            var isFrontAsset = false;
            if( frontAsset && frontAsset.length ){
                isFrontAsset = true;
            }


            var inWhiteList = true;
            if( req.url.indexOf('/user/openid') > -1){
                inWhiteList = true;
            }


            if( !doLogin && !isFrontAsset && !inWhiteList ){
                var hasLogin = utils.hasLogin(req);

                if( !hasLogin ){
                    return res.send(utils.toJson(req, {
                        msg:"请登录",
                        code:-37
                    }));
                }else{
                    req.userId = utils.getUserId(req);
                    return next();
                }
            }else{
                return next();
            }
        });

        // var csrfProtection = csrf({
        //     cookie:true,
        //     ignoreMethods:['GET', 'HEAD', 'OPTIONS']
        // });
        // app.use(function(req, res, next){
        //     if( req.url.indexOf('upload/fileupload') > -1 
        //         || req.url.indexOf('user/authorization') > -1
        //         || req.url.indexOf('user/authorization') > -1){
        //         return next();
        //     }else{
        //         return csrfProtection(req, res, next)
        //     }
        // });
    }
}

module.exports = environment;
