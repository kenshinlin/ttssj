var utils = require('../../utils/utils');
var request = require('request');
var settings = require('../../config/settings');

var fetchUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${settings.wxAppID}&secret=${settings.wxAppSecret}&grant_type=authorization_code&js_code=`;

var ctrl = {

    fetchOpenId:function( req, params, cb ){

        var code = params.code

        if( !code ){
	    utils.error('fetchopenid 没有传 code 参数')
            return cb({msg:"非法请求"})
        }

        request({
            url: fetchUrl+code,
            method: 'GET'
        }, (err, res, body)=>{
                if( err ){
                    utils.error('fetchOpenId request err', err)
                    cb( err )
                }else{
                    if( body ){
                        try{
                            body = JSON.parse( body )
                            if( body.errcode ){
                                utils.error('fetchOpenId wxresp body error', body.errmsg);
                                cb({msg:body.errmsg})
                            }else{
                                cb(null, body)
                            }
                        }catch(e){
                            utils.error('fetchOpenId JSON.parse error catch', body , e);
                            cb({msg:e.message})
                        }
                    }else{
			utils.error('fetchopenid 响应没有内容')
                        cb({msg:"响应没有内容"})
                    }
                }
        }).on('error', err=>{
            utils.error('fetchOpenId request onerror err', err)
            cb(err)
        })
    }

};

module.exports = ctrl;
