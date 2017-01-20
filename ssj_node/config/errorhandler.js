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
        console.log('开发环境 development env~~~~');
        
	    app.use(function(err, req, res, next) {
	        if(err)console.log(err.message);
	        res.status(err.status || 500);
	        res.render('error', {
	            message: err.message,
	            error: err
	        });
	    });
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
	    if(err)console.log(err.message);
	    res.status(err.status || 500);
	    res.render('error', {
	        message: err.message,
	        error: {}
	    });
	});
}
