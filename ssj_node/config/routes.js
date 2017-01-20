var user = require('../app/routes/user');
var record = require('../app/routes/record');

// var upload = require('../app/routes/upload');

module.exports = function (app) {

	app.use('/user', user);
	// app.use('/upload', upload);
	app.use('/record', record);
	
	
	// 拿一个csrf token
	app.get('/token', function(req, res){
	    res.json({
	        data: [],
	        c_t: req.csrfToken(),
	        code:0
	    });
	});

	app.get('/time', function(req, res){
	    res.json({
	        data: +new Date(),
	        code:0
	    });
	});
};
