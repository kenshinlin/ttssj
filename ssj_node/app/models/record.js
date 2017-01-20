module.exports = function (orm, db) {
    db.define('tbl_record',  {
        openid     : { type: 'text', size:800, required: true },
        money  : { type: 'text', required: true},
        createTime   : { type: 'date'},
        recordDate: {type:"text", required:true },
        tag: { type:"text", required:true},
        icon:{type:"text", required:true},
        comment:{type:'text'},
        type:{type:"text", required:true},
        md5:{type:"text", required:true, size:64}
    },{
        hooks:{
            beforeValidation:function () {
                this.createTime = new Date();
            }
        }
    });
};
