var utils = require('../../utils/utils');
var orm = require('orm');

var ctrl = {

    create:function(req, params, callback){
        var db = req.db;

        db.models.tbl_record.create({
            openid: params.openid,
            md5: params.md5,
            money: params.money,
            recordDate:params.recordDate,
            tag: params.tag,
            icon: params.icon,
            comment: params.comment,
            type: params.type,
            project:params.project
        }, (err, record)=>{
            if( err ) {
                utils.log('record_ctrl create err', err)
                return callback({msg:"添加失败"})
            }else{
                callback(null, record)
            }
        })
    },

    detail:function( req, params, callback ){
        var db = req.db;
        var md5 = params.md5;
        var openid = params.openid;

        if( !md5 || !openid ){return callback({msg:"非法请求"+md5+openid})}

        db.models.tbl_record.find({md5:md5, openid:openid}, (err, records)=>{
            if(err){
                utils.log( 'del record err' ,err.message)
                return callback({msg:"获取记录失败"})
            }

            if( !records || !records.length ){ return callback({msg:"没有这条记录"})}
            var record = records[0];

            callback(null, record);
        })
    },

    del:function(req, params, callback){
        var db = req.db;
        var md5 = params.md5;
        var openid = params.openid;

        db.models.tbl_record.find({md5:md5, openid:openid}, (err, records)=>{
            if(err){
                utils.log( 'del record err' ,err.message)
                return callback({msg:"删除失败"})
            }

            if( !records || !records.length ){ return callback({msg:"删除失败，没有这条记录"})}
            var record = records[0];

            record.remove((err)=>{
                if(err){
                    utils.log('del record remove err', err.message)
                    return callback({msg:"删除失败"})
                }else{
                    callback(null)
                }
            })
        })
    },

    // 指定月份起，最新一条历史数据的日期
    findLastestOneHistoryRecordDate:function( db, params, callback){

         var query = {
            openid: params.openid,
            recordDate: orm.lt([params.year, params.month, '00'].join('-'))
        }

        db.models.tbl_record.find(query).limit(1).all(function (err, records ){
            if( err ){console.log('findLastestOneHistoryRecordDate '+err.message);return callback({msg:"获取失败"})}

            if( !!records && records.length ){
                var r = records[0];
                var d = r.recordDate||""

                d = d.split('-');
                if( !d.length ){return callback({msg:"获取失败"})}

                callback( null, {
                    year: d[0],
                    month: d[1],
                    day: d[2]
                })
            }else{
                var isEmpty = true;
                callback(null, isEmpty)
            }
        });
    },

     // 找一个月的记录
    findOneMonthList:function(db, params, callback){
        if( !params.openid || !params.year || !params.month )return callback({msg:"非法请求"});

        var year = params.year,
            month=params.month;

        var query = {
            openid: params.openid,
            recordDate:orm.between([year, month, '00'].join('-'), [year, month, '32'].join('-'))
        }

        db.models.tbl_record.find(query).order('-recordDate').all(function (err, records ) {
            if( err ){
                console.log('findOneMonthList', err.message)
                callback({
                    msg: '获取记账数据失败'
                });
                return;
            }
            callback( null, records);
        });   
    },

    // 统计页面，获取一个月的数据
    monthList:function (req, params, callback) {
        var me = this;
        var db = req.db;

        var month = ("000"+params.month).substr(-2);
        var year = params.year;

        params.month = month;

        ctrl.findOneMonthList( db, params, (err, records)=>{
            if( err ){
                callback({
                    msg: '获取记账数据失败'
                });
                return;
            }
            callback( null, records);
        })     

    },

    // 首页的list
    list:function (req, params, callback) {
        var me = this;
        var db = req.db;

        // var page = params.page||1;
        // var pagesize = params.pagesize||10;

        var month = ("000"+params.month).substr(-2);
        var year = params.year;

        params.month = month;

        ctrl.findOneMonthList( db, params, (err, records)=>{
            if( err ){
                callback({
                    msg: '获取记账数据失败'
                });
                return;
            }

            // 没找到数据，那么去找历史数据中最新一条的日期
            if( !records.length ){
                ctrl.findLastestOneHistoryRecordDate(db, params, (err, d)=>{
                    if( err){return callback(err)}

                    var isEmpty = true;

                    if( d === isEmpty ){return callback(null, [])}
                    var q = {
                        openid: params.openid,
                        year: d.year,
                        month: d.month,
                        day: d.day
                    }

                    ctrl.findOneMonthList(db, q, (err, rs)=>{
                        if( err ){return callback({msg:"获取记账数据失败"})}
                        return callback(null, rs)
                    })
                })
            }else{
                callback( null, records);
            }
        })     

    },

    // 一年的总开销和总收入
    yearTotalSummary:function( req, params, callback){
        var me = this;
        var db=req.db;

        var now = new Date();
        var year = params.year||now.getFullYear();
        
        var startDate = [year, '01', '00'].join('-')
        var endDate = [year, '12', '32'].join('-');

        var openid = params.openid
        if( !openid ){
            return callback({msg:"非法请求"})
        }

        db.driver.execQuery(
            "SELECT type,SUM(money) AS money FROM tbl_record WHERE openid=? AND recordDate>=? AND recordDate<=? GROUP BY type",
            [openid, startDate, endDate],
            (e, r)=>{ 
                if( e ){console.log(e.message);return callback({msg:"查询失败"})}

                !!r&&r.length&& (r = r.map(i=>{
                    return {
                        type: i.type,
                        money: Math.round( i.money*100 )/100
                    }
                }))
                callback(null, r)
            }
        )

    }

};

module.exports = ctrl;