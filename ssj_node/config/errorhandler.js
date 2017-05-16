var utils = require('../utils/utils')

module.exports = function (app) {
	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
	    var err = new Error('Not Found');
	    err.status = 404;
	    next(err);
	});

	// error handlers

	// development error handler
	// will print stacktrace

	var env = process.env.NODE_ENV || 'release'
	if ( env === 'dev') {
        utils.log('开发环境 development env~~~~');
        
	    app.use(function(err, req, res, next) {
	        if(err)utils.error(err.message);
	        res.status(err.status || 500);
	        res.render('error', {
	            message: err.message,
	            error: err
	        });
	    });
	}

	if( env === 'release' ){
		utils.log('生产环境 启动服务...')
		app.use(function(err, req, res, next) {
		    if(err)utils.error('errorHandler 出错 服务器将500',err);
		    res.status(err.status || 500);
		    res.render('error', {
		        message: err.message,
		        error: {}
		    });
		});

	}
}
