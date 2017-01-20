var express = require('express');
var router = express.Router();

var userCtrl = require('../controllers/user_ctrl');
var utils = require('../../utils/utils');


router.get('/openid', (req, res, next)=>{
	var params = req.query;

	userCtrl.fetchOpenId(req, params, function (err, result) {
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


module.exports = router;