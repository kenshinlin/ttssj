var httpSync = require('sync-request');
var iconv = require('iconv-lite');

var io = {
	baseUrl: "http://172.24.178.90:7070/galaxy",

	getGalaxyToken: function  (req) {
		return req.session.userInfo && req.session.userInfo.galaxyToken?req.session.userInfo.galaxyToken:"0"
	},

	buildUrl:function (options) {
		var commandId = options.commandId;
		var service = options.service;

		if( !commandId || !service){
			return false;
		}
		return [this.baseUrl, service, commandId].join('/');
	},

	buildReqBody:function (req, param) {
		var token = this.getGalaxyToken(req);

		return {
			req: JSON.stringify(param),
			token: token
		};
	},

	parseRespBody:function(req, result){
		var body = result.getBody();
		body = iconv.decode(body, 'GBK');

		console.log('结果', body);

		var parsedBody = body.split('|');

		if( parsedBody.length < 2 ){
			return false;
		}

		var galaxyToken = parsedBody[0];
		req.session.userInfo = {
			galaxyToken:galaxyToken
		};

		var jsonData;
		try{
			jsonData = JSON.parse(parsedBody[parsedBody.length-1]);
		}catch(e){
			console.error('io.getError', e.message);
			return false;
		}
		return jsonData;
	},

	get:function  (req, param, options) {
		options = options||{};
		var query = this.buildReqBody(req, param);
		var url = this.buildUrl(options);

		if( !url ){
			return false;
		}

		console.log('请求参数', query);
		var result = httpSync('GET', url, {
			qs: query
		});

		var jsonData = this.parseRespBody(req, result);

		return jsonData;
	},

	post:function  (req, param,options) {
		options = options||{};
		var query = this.buildReqBody(req, param);
		var url = this.buildUrl(options);

		var result = httpSync('POST', url, {
			json: query
		});

		var jsonData = this.parseRespBody(req, result);

		return jsonData;
	}
}

module.exports = io;
