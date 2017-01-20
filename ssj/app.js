//app.js

App({

    onLaunch: function () {
        var that = this;

        //调用API从本地缓存中获取数据
        wx.getStorage({
            key:'flowlist',
            success:function(res){
                that.globalData.flowList = res.data||[];
                // 先在这里模拟一下后台数据
            }
            // ,fail:(e)=>this.globalData.flowList = this.defaultData
        }),

        wx.getStorage({
            key:'budget',
            success:function(res){
                if( res.data ){
                    that.globalData.budget = res.data;
                }else{
                    // 从服务器中取预算，暂不用
                }
            }
        }) 
    },
    getUserInfo:function(cb){
        var that = this
        if(this.globalData.userInfo){
            typeof cb == "function" && cb(this.globalData.userInfo)
        }else{
        //调用登录接口
            wx.login({
                success: function ( data ) {
                    var code  = data.code;

                    wx.getUserInfo({
                        success: function (res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })

                    wx.request({
                        url: that.globalData.settings.host+'/user/openid',
                        data: {
                            code: code
                        },
                        success:function(res){
                            if( res.data && res.data.code == 0 && res.data.data ){
                                that.globalData.openid = res.data.data.openid
                            }
                        }
                    })
                }
            })
        }
    },
    globalData:{
        userInfo:null,
        flowList:[],
        settings:{
            host:"https://stu.kenniu.top"
        },
        budget: 0,
        month:null,
        year:null
    }
})