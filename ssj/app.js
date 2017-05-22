let http = require('utils/http')
let util = require('utils/util')

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

        this.initServerTime()

    },

    /**
     * 使用服务器的时间
     */
    initServerTime:function(){

        http.get({
            url: '/time',
            success: data => {
                let d = new Date(data * 1)
                this.globalData.month = d.getMonth() + 1;
                this.globalData.year = d.getFullYear();
                this.globalData.date = d.getDate();
            }
        }, this)
    },

    /**
     * 初始化用户信息，用户头像可能会授权失败，但 openID 是可以拿到的
     */
    initUserInfo:function( callback ){

        if( !!this.globalData.userInfo && this.globalData.openid ){
            callback()
        }else{
            wx.login({
                success: res=>{
                    let code = res.code


                        
                    this.getUserInfoNotPromise( callback ) // 获取用户昵称，头像
                    this.getOpenIDNotPromise( code, callback ) // 获取 openID

                    /**
                     * iOS 不支持Promise.all
                     */
                    
                    // Promise.all([
                        
                    //     this.getUserInfo(), // 获取用户昵称，头像
                    //     this.getOpenID( code ) // 获取 openID

                    // ]).then( result =>{
                    //     let userInfo = result[0]
                    //     let openid = result[1]

                    //     this.globalData.userInfo = userInfo
                    //     this.globalData.openid = openid
                        
                    //     callback()

                    // }).catch( e=>{
                    //     console.log('iniUserInfo error' , e)
                    //     util.alert('数据初始化失败，请退出重试')
                    // })
                }
            })
        }
    },

    getOpenIDNotPromise:function( code, callback ){
        http.get({
            url: '/user/openid',
            data: { code: code },
            success: data => {
                let openid = data.openid
                this.globalData.openid = openid

                if( this.globalData.userInfo){
                    callback()
                }
            },
            error: e => {console.log('fetchopenid error',e)}
        }, this)
    },

    getUserInfoNotPromise: function( callback ){
        wx.getUserInfo({
            success: res=>{
                this.globalData.userInfo = res.userInfo
            },
            fail: res => {
                console.log('getUserInfo fail', res)
                this.globalData.userInfo = true //没有拿到userInfo也不要紧
            },
            complete:res=>{
                if( this.globalData.openid ){
                    callback()
                }
            }
        })
    },


    getUserInfo:function(){
        return new Promise((resolve, reject)=>{
            wx.getUserInfo({
                success: uRes =>resolve(uRes.userInfo),
                fail: uRes => {
                    console.log('getUserInfo fail', uRes)

                    // @NOTE 以下代码未经严格测试，慎用
                    // wx.openSetting({
                    //     success:osRes=>{
                    //         console.log('openSetting', osRes)
                    //         if (osRes.authSetting && osRes.authSetting.userInfo===true){
                    //             wx.getUserInfo({
                    //                 success: uRes => this.globalData.userInfo = uRes.userInfo
                    //             })
                    //         }
                    //     }
                    // })
                    //@TODO 要不要弹提示
                    // @NOTE 不弹了，没有授权则用户名不显示，要不显示null，显示‘欢迎使用’

                    resolve() //所以不 reject
                }
            })
        })
    },

    getOpenID:function( code ){
        return new Promise( (resolve, reject)=>{
            http.get({
                url: '/user/openid',
                data: { code: code },
                success: data => resolve( data.openid ),
                error: e => reject(e)
            }, this)
        })
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