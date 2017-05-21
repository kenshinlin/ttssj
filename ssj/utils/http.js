
function request(options, app) {
	let g = app.globalData

	wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
      mask:true
    })

	wx.request({
		
		url: g.settings.host+options.url,
		
		data: Object.assign( {
				openid: app.globalData.openid
			}, options.data),

		method: options.method,

		success:res=>{
            if (res.statusCode != 200) return wxAlert('请求失败');
            
            let data = res.data;

            // 正确
            if( data.code == 0 ){
            	options.success(data.data)
            }else{
            	if( options.error ){
		        	options.error(data.msg||'请求失败')
            	}else{
            		wxAlert(data.msg||'请求失败')
            	}
            }
		},
		fail:function( data ){
            console.log('request error', options.url, data)

			if( options.error ){
	        	options.error('请求失败')
        	}else{
        		wxAlert('请求失败')
        	}
		},
        complete:e=>{
        	options.complete && options.complete()
        	wx.hideToast()
        }
	})
}

function wxAlert(msg){
	wx.showModal({
	  	title: '提示',
	  	content: msg,
	  	showCancel:false
	});
}

let http = {

	get:function(options, app) {
		return request( Object.assign({},options, {method:'GET'}), app)
	},

	post:function (options, app) {
		return request( Object.assign({},options, {method:'POST'}), app)
	}
}

module.exports = http