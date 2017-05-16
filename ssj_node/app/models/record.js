module.exports = function (orm, db) {
    db.define('tbl_record',  {
        openid     : { type: 'text', size:800, required: true },
        money  : { type: 'text', required: true},
        createTime   : { type: 'date', time:true},
        recordDate: {type:"text", required:true },
        tag: { type:"text", required:true},
        icon:{type:"text", required:true},
        comment:{type:'text'},
        type:{type:"text", required:true},
        md5:{type:"text", required:true, size:64},
        project:{type:"text", size:45}
    },{
        hooks:{
            beforeCreate:function () {
                this.createTime = new Date();
            }
        }
    });
};
