var express = require('express');
var router = express.Router();

var projectCtrl = require('../controllers/project_ctrl');
var utils = require('../../utils/utils');


[
	'total',
	'flow',
	''
].forEach( action => {
	router.get('/'+action, (req, res, next)=>{
		if( action === ''){
			action = 'list'
		}
		var params = req.query;

		projectCtrl[action](req, params, function (err, result) {
			if( err ){
				res.json(utils.toJson(req, {
					code: -1,
					msg: err.msg || '查询失败'
				}));
			}else{
				res.json( utils.toJson(req, {
	                data:result
	            }) );
			}
		});
	});
})


module.exports = router;