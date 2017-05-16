const log4js = require('log4js');
var settings = require('./settings')
var fs = require('fs')
var path = require('path')

var project  = settings.project;
var logPath = settings.logPath;
var env = settings.env;

if( !logPath || !project ){
    console.error('缺少log4Path和project配置项，请检测settings.js')
}

var log4Path = path.join(logPath, 'log4js/')
try{
    fs.mkdirSync(log4Path)
}catch(e){
    if( e && e.code != 'EEXIST'){
        console.log('创建log4日志根目录失败', e)
    }
}

log4js.configure({
    appenders:[{
        type:"console",
        category:"consoleLog"
    },{
        type:"dateFile",
        filename: log4Path,  //要确保目录已经存在
        pattern:[ 'node', "yyyyMMdd.log"].join('-'),
        alwaysIncludePattern:true,
        category:'fileLog'
    }],

    replaceConsole:true,
    levels:{
        fileLog: env=='release'?'info':'debug',
        consoleLog:'debug'
    }
})

var category = 'fileLog';
if( env == 'debug'){
    category = 'consoleLog'
}

var logger = log4js.getLogger(category);
module.exports = logger
