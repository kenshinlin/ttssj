let utils = require('../../utils/utils');
let request = require('request');
let settings = require('../../config/settings');

let ctrl = {

	/**
	 * 当前用户的项目列表
	 * @param  {[type]}   req    [description]
	 * @param  {[type]}   params [description]
	 * @param  {Function} cb     [description]
	 * @return {[type]}          [description]
	 */
    list:function( req, params, cb ){

        let openid = params.openid
        let db=req.db

        if( !openid ){
            return cb({msg:"非法请求"})
        }

        db.driver.execQuery(
            "SELECT DISTINCT project FROM tbl_record WHERE openid=?",
            [openid],
            (e, r)=>{ 
                if( e ){console.log(e.message);return cb({msg:"查询失败"})}
                cb(null, r)
            }
        )
    },

    /**
     * 某项目的流水
     * @type {[type]}
     */
    flow:function(req, params, cb) {
    	let openid = params.openid
    	let project = params.project
    	let db = req.db

    	if( !openid || !project  ){
    		return cb({msg:"非法请求"})
    	}

    	let query = {
    		openid: openid,
    		project: project
    	}

    	db.models.tbl_record.find(query).order('-recordDate').all((err, records)=>{
    		if( err ){
    			return cb({
    				msg:"查询失败"
    			})
    		}

    		cb(null, records)
    	})
    },

    /**
     * 某项目的总金额
     * @param  {[type]}   req    [description]
     * @param  {[type]}   params [description]
     * @param  {Function} cb     [description]
     * @return {[type]}          [description]
     */
    total:function(req, params, callback){
        var db=req.db;

		let project = params.project
        var openid = params.openid

        if( !openid || !project  ){
    		return cb({msg:"非法请求"})
    	}

        db.driver.execQuery(
            "SELECT SUM(money) AS total FROM tbl_record WHERE openid=? AND project=?",
            [openid, project],
            (e, r)=>{ 
                if( e ){console.log(e.message);return callback({msg:"查询失败"})}

                if( r && r.length ){
	                callback(null, r[0].total||0)
                }
            }
        )

    }

};

module.exports = ctrl;