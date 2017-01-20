// var log4 = require('log4js')
var path = require('path')

// log4.configure(path.join(__dirname, '../config/log4js.json'))
// var logInstance = log4.getLogger('cheese');

var utils = {
	toJson:function(req, options){

		var data = options.data;
		var code = options.code || 0;
		var msg = options.msg||'ok';

		if( code == 0 ){
			return {
				data: data,
				code: 0,
				msg: msg,
				c_t: typeof req.csrfToken == 'function' ? req.csrfToken(): undefined
			}
		}else{
			return {
				data:[],
				code: code||-1,
				msg: msg,
				c_t: typeof req.csrfToken == 'function' ? req.csrfToken(): undefined
			}
		}
	},

	hasLogin:function(req){
		// @Note just for test;
		if( req.query.god ){
			req.session.userInfo = {Id:req.query.god, Username:'god'};
		}
		return !!req.session.userInfo;
	},

	getUserInfo:function(req, callback){
		if( !req.session.userInfo ){
			// callback(this.toJson('请登录', -100));
			return false;
		}else{
			return req.session.userInfo;
		}
	},

	getUserId:function( req, callback ){
		var userInfo = this.getUserInfo(req, callback);

		if( userInfo ){
			return userInfo['_id'];
		}else{
			return false;
		}
	},

	betweenTime:function(s,e,t){

		s = s.split(':');
		e = e.split(':')

		if( s.length < 2 || e.length<2)return false;

		s[0] = ('000'+s[0]).substr(-2)
		s[1] = ('000'+s[1]).substr(-2)
		e[0] = ('000'+e[0]).substr(-2)
		e[1] = ('000'+e[1]).substr(-2)

		s = s.join(':');
		e = e.join(':');
		
		if(!t){
			t = new Date();
            var hour = t.getHours();
            hour = ('0000'+hour).substr(-2);
            var minute = t.getMinutes();
            minute = ('0000'+minute).substr(-2);

            t = [hour , minute].join(':');
		}

		return s<=t && t<=e;
	},

	log:function( data ){
		if( typeof data == 'object' ){
			data = JSON.stringify(data);
		}
		// logInstance.info(data);
		console.info(arguments);
	},
	isDirExsist:function( p, cb ){
		utils.isExsist( p, cb, 'Directory')
	},

	isFileExsist:function(p, cb){
		utils.isExsist( p, cb, 'File')
	},

	isExsist:function( p, cb, type){
		var fs = require('fs');
		type = type||'Directory';

		fs.stat(p, function (err, stat) {

			// 不存在才需要去同步文件
			var exsist = stat && typeof stat['is'+type] == 'function' && stat['is'+type]();
			if ( exsist ) {
				console.log('存在',p)
				return cb( null, true);
			}

			if( err && err.code == 'ENOENT' ){
				cb( null, false);
			}else{
				cb(err)
			}
		});
	}
}

module.exports = utils;
