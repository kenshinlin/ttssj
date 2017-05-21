let http = require('../../utils/http')

//获取应用实例
let app = getApp()

Page({
    data: {
        motto: '不会记录用户隐私的微信记账小程序',
        userInfo: {},
        canUseShareBtn: true
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
            desc: '不会记录用户隐私的微信记账小程序',
            path: 'pages/about/index?action=新人'
        }
    },

    onLoad: function ( query ) {
        this.setData({
            userInfo: app.globalData.userInfo||{},
            action: query.action,
            canUseShareBtn: !!wx.canIUse && wx.canIUse('button.open-type.share')
        })

        if( !app.globalData.userInfo ){
            app.initUserInfo(e=>this.setData({userInfo: app.globalData.userInfo}))
        }
    }
})
