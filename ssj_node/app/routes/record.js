var express = require('express');
var router = express.Router();

var recordCtrl = require('../controllers/record_ctrl');
var utils = require('../../utils/utils');


router.post('/del', (req, res, next)=>{
	var param = req.body;

	recordCtrl.del(req, param, function (err, result) {
		if( err ){
			res.json(utils.toJson(req, {
				code: -1,
				msg: err.msg || '删除失败'
			}));
		}else{
			res.json( utils.toJson(req, {
                data:result
            }) );
		}
	});
});
router.post('/item', (req, res, next)=>{
	var param = req.body;

	recordCtrl.create(req, param, function (err, result) {
		if( err ){
			res.json(utils.toJson(req, {
				code: -1,
				msg: err.msg || '添加失败'
			}));
		}else{
			res.json( utils.toJson(req, {
                data:result
            }) );
		}
	});
});

router.post('/list', (req, res, next)=>{
	var param = req.body;

	console.log(req.url, param)
	recordCtrl.list(req, param, function (err, result) {
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

router.get('/list', (req, res, next)=>{
	var param = req.query;

	recordCtrl.list(req, param, function (err, result) {
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


router.post('/monthlist', (req, res, next)=>{
	var param = req.body;

	recordCtrl.monthList(req, param, function (err, result) {
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

router.get('/item/:id', (req, res, next)=>{
	var param = req.params||{};

	var query = req.query||{};

	param.openid = query.openid;
	param.md5 = param.id;

	recordCtrl.detail(req, param, function (err, result) {
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

router.get('/year/summary', (req, res, next)=>{

	var query = req.query||{};

	recordCtrl.yearTotalSummary(req, query, function (err, result) {
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
