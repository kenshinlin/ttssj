var express = require('express');
var router = express.Router();
var utils = require('../../utils/utils');


var fs = require("fs");
var path = require('path');

var multer  = require('multer');
var multerUpload = multer({
    dest:  path.join(__dirname, '../../public/upgrade/')
});

// {
// 		"originalName":"demo.jpg",
// 		"name":"demo.jpg",
// 		"url":"upload\/demo.jpg",
// 		"size":"99697",
// 		"type":".jpg",
// 		"state":"SUCCESS"
// 	}
router.post('/fileupload', multerUpload.single('upfile'), (req, res, next ) => {
	if( req.file ){
		var basePath = 'upgrade/';
		var fileData = req.file;
		var version = req.body.Version;

		var fileType = ".json";
		var originalFileName = fileData.originalname;

		originalFileName = originalFileName.split('.');
		var len = originalFileName.length;
		fileType = len > 1 ? originalFileName[len-1]:fileType;

		fs.rename(fileData.path, fileData.path+'.'+fileType, function(err) {
			if( err ){
				res.send(JSON.stringify({
		  			msg:'文件上传失败，请重试',
		  			state:"FAIL"
		  		}));
			}else{
				res.send(JSON.stringify({
		  			"originalName":fileData.originalname,
					"name":fileData.filename,
					"url": basePath+fileData.filename+'.'+fileType,
					"size":fileData.size,
					"type": fileData.mimetype,
					"state":"SUCCESS"
		  		}));
			}
		})

	}else{
		res.json( utils.toJson(req, {
			code: -1,
			msg: "上传失败"
		}));
	}
});


router.post('/', (req, res, next) => {
	var md5 = require('md5');

	var frontEndPath = path.join(__dirname, '../public/') ;
	var basePath = 'uimg/';
	var base64Data = req.body.base64;
	var fileName = md5(base64Data)+'.jpg';
	var pathToFile = frontEndPath + basePath+fileName;

	fs.writeFile( pathToFile, base64Data, 'base64', function(err) {
	  	if( err ){
	  		console.log(err);
	  		res.json( utils.toJson(req, {
	  			msg:'文件上传失败，请重试',
	  			code: -1
	  		}) );
	  	}else{
	  		res.json( utils.toJson(req, {
	  			data: basePath+fileName
	  		}));
	  	}
	});
});

module.exports = router;
