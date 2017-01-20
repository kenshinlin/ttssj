//index.js
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
  onLoad: function () {
    wx.request({
      url:app.globalData.settings.host+'/time',
      success:res=>{
        if( res.statusCode != 200 )return;

        var data  = res.data||{};
        if( data.code == 0){
          var d = new Date(data.data*1)
          app.globalData.month = d.getMonth()+1;
          app.globalData.year = d.getFullYear();
          app.globalData.date = d.getDate();
        }
      },
      complete:()=>{
        //调用应用实例的方法获取全局数据
        app.getUserInfo(userInfo=>{
          //更新数据
          this.setData({
            userInfo:userInfo
          })
        })
      }
    })
  }
})
