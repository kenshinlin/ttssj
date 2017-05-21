var http = require('../../../utils/http');

var app = getApp();

Page({
	data:{
		projects: [],
		projectInput:''
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

		this.setData({
			projectInput: app.globalData.selectProject
		})
	},


	onProjectChange:function (e) {
		var value = e.detail.value;

		if( value.length > 10 ){
			wx.showModal({
				title:"提示",
				content:"不能多于6个字",
				showCancel:false
			})
			value = value.substr(0, 10);
		}

		this.setData({
	      	projectInput: value
	    })
	},

	saveProject:function () {
		let projects = this.data.projects;

		!!this.data.projectInput && projects.push(this.data.projectInput)
		
		app.globalData.projects = projects;

		this.setSelectProject(this.data.projectInput)
		
		this.setData({
			projects: projects,
			projectInput:''
		})

	},

	selectProject:function(e) {
		var selProj = e.target.dataset.proj;
		this.setSelectProject(selProj)
	},

	setSelectProject:function (project) {
		app.globalData.selectProject = project;
		wx.navigateBack();
	},

	fetchProjects:function () {
		http.get({
            url: '/project/',
            success:data=>{
            	let projects = [];
            	if( data && data.length){
            		data.forEach(item=>{
            			!!item && !!item.project && projects.push(item.project)
            		})
            	}

            	this.setData({	
            		projects: projects
            		// projects: ['装修', '爸妈医疗', '买房', '车', '孩子培训班', '学唱歌','研究生', '考试', '2017年去日本']
            	})
            },
            fail:e=>{}
        }, app);
	}
})