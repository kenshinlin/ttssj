let http = require('../../utils/http')

//获取应用实例
var app = getApp()

Page({
    data: {
        motto: '不会上传账户信息的微信记账小程序',
        userInfo: {}
    },
  //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../app/index'
        })
    },

    onShareAppMessage: function () {
        return {
            title: '天天随手记账',
            desc: '一款不会上传用户信息的记账小程序',
            path: 'pages/index/index'
        }
    },

    onLoad: function () {
        http.get({
            url:'/time',
            success:data=>{
              var d = new Date(data*1)
              app.globalData.month = d.getMonth()+1;
              app.globalData.year = d.getFullYear();
              app.globalData.date = d.getDate();
            }
        }, app)
        app.getUserInfo(userInfo=>{
            //更新数据
            this.setData({
                userInfo:userInfo
            })
        })
    }
})
