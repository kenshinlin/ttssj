var express = require('express');

var environment = require('./config/environment');
var errorhandler = require('./config/errorhandler');
var settings = require('./config/settings');
var models = require('./config/models');
var routes = require('./config/routes');
// require("babel/polyfill"); //使用到Generator时要用到，参考https://babeljs.io/docs/usage/polyfill/

var app = express();

environment.initialize(app);
models(app);
routes(app);
errorhandler(app);


module.exports = app;
