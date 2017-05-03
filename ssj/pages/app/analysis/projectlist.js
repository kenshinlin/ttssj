var http = require('../../../utils/http')

var app = getApp();

Page({
	data:{
		projects: [],
	},

	onLoad:function () {
		let projects = app.globalData.projects;

		// 有缓存则用缓存，没有才去加载
		if(projects && projects.length){
			this.setData({
				projects: projects
			})
		}else{
			this.fetchProjects()
		}
	},

	fetchProjects:function () {
        http.get({
            url:"/project/",
            data: {
                openid: app.globalData.openid
            },
            success:data=>{
                let projects = [];
                if( data && data.length){
                    data.forEach(item=>{
                        !!item && !!item.project && projects.push(item.project)
                    })
                }
                this.setData({  
                    projects: projects
                })
            }
        }, app)
	}

})