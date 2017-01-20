var app = getApp();
var md5 = require('../../utils/md5');
var globalData = app.globalData;
var settings = globalData.settings;

Page({
	tags:{
		income: [{
			icon: "job",
			tag:"工资"
		},{
			icon: "tz",
			tag:"投资"
		},{
			icon: "zj",
			tag:"租金"
		},{
			icon: "jjin",
			tag:"奖金"
		},{
			icon: "jz",
			tag:"兼职"
		}],
		payout:[{
			icon:'foot',
			tag:'吃喝'
		},{
			icon:'jt',
			tag:'交通'
		},{
			icon:'fs',
			tag:'服饰'
		},{
			icon:'jj',
			tag:'居家'
		},{
			icon:'yl',
			tag:'娱乐'
		},{
			icon:'tx',
			tag:'通讯'
		},{
			icon:'xz',
			tag:'学杂'
		},{
			icon:'ly',
			tag:'旅游'
		},{
			icon:'rq',
			tag:'人情'
		},{
			icon:'yiliao',
			tag:'医疗'
		}]
	},
	data:{
		tags:[],
		selectedTag:{
			icon:"foot",
			tag:"吃喝"
		},
		comment:"",
		type:"payout",
		money:"",
		recordDate:"",
		pickerMaxDate:""
	},

	isEdit:false,

	onLoad:function( options ){

		var md5 = options.md5;

		this.initDate();
		if( md5 ){
			this.isEdit = true;
			this.loadRecord( md5 );
		}else{
			this.setData({
				tags: this.tags[this.data.type]
			})
		}

	},

	onReady:function(){
		let t = "添加记录";
		if(this.isEdit){t="修改记录"}
        wx.setNavigationBarTitle({title:t})
    },

	loadRecord:function(md5){
		var flowList = app.globalData.flowList||[];
		var record = flowList.find( item=>item.md5===md5)

		if( record ){
			console.log('loadRecord', record)

			this.setData({
				tags: this.tags[record.type],
				selectedTag:{
					tag: record.tag,
					icon: record.icon
				},
				type: record.type,
				money: record.money,
				comment: record.comment,
				recordDate: record.recordDate,
				md5: md5
			});
		}else{
			this.loadRecordFromRemote(md5)
		}
		
	},

	loadRecordFromRemote:function(md5){

		wx.request({
            url: app.globalData.settings.host+'/record/item/'+md5,
            data: {
                openid: app.globalData.openid
            },
            method:"GET",
            success:res=>{
           		if( res.statusCode != 200)return;
                
                var data = res.data;

                // 正确
                if( data.code == 0 ){
                	if( !!data.data ){
                		var record = data.data;

                		this.setData({
							tags: this.tags[record.type],
							selectedTag:{
								tag: record.tag,
								icon: record.icon
							},
							type: record.type,
							money: record.money,
							comment: record.comment,
							recordDate: record.recordDate,
							md5: md5
						});
                	}else{
                		wx.showModal({
                			title:"提示",
                			content:"加载失败，请重试",
                			showCancel:false
                		})
                	}
                }else{
                	wx.showModal({
						title:"提示",
						content: data.msg||"记录加载失败，请重试",
						showCancel:false
					})
                }
            }
        });
	},

	initDate:function(){
		var now = new Date();
		var year = app.globalData.year;
		var month = app.globalData.month;
		var day = app.globalData.date;

		// var month = now.getMonth()+1;
		// var day = now.getDate();

		month = ('000'+month).substr(-2);

		var initday = ('000'+day).substr(-2);
		var pickerday = Math.max(day, 28);

		this.setData({
			recordDate: [year,month, initday].join('-'),
			// pickerMaxDate: [year,month, pickerday].join('-')
			pickerMaxDate: [year,month, initday].join('-')
		})
	},

	bindinput:function(e) {
		this.setData({
	      money: e.detail.value
	    })
	},

	bindCommentInput:function(e){
		var value = e.detail.value;

		if( value.length > 10 ){
			wx.showModal({
				title:"提示",
				content:"备注不能多于10个字",
				showCancel:false
			})
			value = value.substr(0, 10);
		}
		this.setData({
	      comment: value
	    })
	},

	closeEditor:function(){
		wx.navigateBack()
	},

	submitDataAndBack:function(){

		var data = {
			tag: this.data.selectedTag.tag,
			icon: this.data.selectedTag.icon,
			type: this.data.type,
			money: this.data.money,
			comment: this.data.comment,
			recordDate: this.data.recordDate
		}

		if( !data.money ){
			wx.showModal({
				title:"信息不全",
				content:"请输入金额",
				showCancel:false
			});
			return;
		}

		if( this.data.md5 ){

			this.editData( this.data.md5 );
			wx.navigateBack()
			this.addData( data )

		}else{
			this.addData( data )
			wx.showToast({
			  	title: '添加成功',
			  	icon: 'success',
			  	duration: 1000
			})
			this.setData({
				money:"",
				comment:""
			})
		}
		
	},


	// 删掉md5 那么条数据
	editData:function(md5){
		this.delRemoteData(md5)
		this.delLocalData(md5);
	},

	delRemoteData:function(md5){
		var that = this;

		console.warn('删除', {md5:md5, openid: app.globalData.openid});

		wx.request({
			url: settings.host+'/record/del',
			data: {md5:md5, openid: app.globalData.openid},
			// header: {
			// 	openid: globalData.userInfo.openid||""
			// },
			method:"POST",
			success:function(data){
				data = data||{};

				if( data.code == 0){
					// 更新localstorage 和 globalData
					// @TODO 等后台做好再放开
					// that.updateStorage(data.data);
				}else{
					console.log('删除数据失败')
				}
			},
			fail:function( data ){
				data = data||{}
				if( data.code!=0){
					// 提示 @TODO
					return;
				}
				// 提示未知错误
			}
		})
	},

	delLocalData:function(md5){
		var newData = [];
		var flowList = app.globalData.flowList;

		flowList.forEach(item=>{
			if( item.md5 != md5 ){
				newData.push( item )
			}
		})

		try{
			console.log('delLocalData flowList', newData)
			wx.setStorageSync('flowlist', newData);
			app.globalData.flowList = newData;
		}catch(e){
			console.log('删除一个记账失败', md5)
			return false
		}
		
	},

	addData:function( data ){
		data.md5 = md5( JSON.stringify(data)+ (+new Date) )
		if( false == this.saveLocal(data) ){
			wx.showModal({
			  	title: '提示',
			  	content: '保存数据失败',
			  	showCancel:false
			});
			return;
		}

		this.submitData(data)
	},

	saveLocal2:function( data ){
		var flowList;
		try{
			flowList = wx.getStorageSync('flowlist');
			console.log(typeof flowList,flowList)
		}catch(e){
			console.log('获取记账数据失败',e);
			return;
		}

		if(!flowList)flowList=[];

		flowList.push( data );
		flowList.sort( (a,b) => a.recordDate<=b.recordDate?1:-1 );

		// 大于30条本地存储，则删掉本月以外的数据
		if( flowList.length > 30 ){
			var result = [];
			flowList.forEach(item=>{
				var month = new Date().getMonth()+1;
				var recordDate = item.recordDate.split('-');
				var recordMonth = recordDate[1]*1;

				if( recordMonth == month ){
					result.push( item )
				}
			})
			flowList = result;
		}


		try{
			console.log('saveLocal flowList', flowList)
			wx.setStorageSync('flowlist', flowList);
			app.globalData.flowList = flowList;
		}catch(e){
			console.log('添加一个记账失败', e)
		}
		
	},

	saveLocal:function( data ){
		var flowList = app.globalData.flowList;

		if(!flowList)flowList=[];

		flowList.push( data );
		flowList.sort( (a,b) => a.recordDate<=b.recordDate?1:-1 );

		// 大于30条本地存储，则删掉本月以外的数据
		// if( flowList.length > 30 ){
		// 	var result = [];
		// 	flowList.forEach(item=>{
		// 		var month = new Date().getMonth()+1;
		// 		var recordDate = item.recordDate.split('-');
		// 		var recordMonth = recordDate[1]*1;

		// 		if( recordMonth == month ){
		// 			result.push( item )
		// 		}
		// 	})
		// 	flowList = result;
		// }


		try{
			console.log('saveLocal flowList', flowList)
			app.globalData.flowList = flowList;
			// wx.setStorageSync('flowlist', flowList);
		}catch(e){
			console.log('添加一个记账失败', e)
		}
		
	},

	// 更新 globaldata 和 localstorage
	updateStorage:function(item){
		var flowList = app.globalData.flowList
		flowList.forEach( (flow, i)=>{
			if( flow.md5 == item.md5 ){
				flowList[i].id = item.id;
			}
		})

		app.globalData.flowList = flowList;
		try{
			wx.setStorage({
				key:'flowlist',
				data: flowList
			})
		}catch(e){
			console.log('updateStorage setStorage失败', e.message)	
		}

	},

	submitData:function(data){
		var that = this;


		data.openid = app.globalData.openid;

		wx.request({
			url: settings.host+'/record/item',
			data: data,
			// header: {
			// 	openid: globalData.openid||""
			// },
			method:"POST",
			success:function(data){
				data = data||{};

				if( data.code == 0){
					// 更新localstorage 和 globalData
					// @TODO 等后台做好再放开
					// that.updateStorage(data.data);
				}
			},
			fail:function( data ){
				data = data||{}
				if( data.code!=0){
					// 提示 @TODO
					return;
				}
				// 提示未知错误
			}
		})


	},

	selectTag:function(e){
		var icon = e.target.dataset.icon;
		var tag = e.target.dataset.tag;

		this.setData({
			selectedTag:{
				icon:icon,
				tag:tag
			}
		})
	},
	bindDateChange:function(e){
		var v = e.detail.value;
		// 修正一下日期
		if( v.length != 10){
			v = v.split('-');
			if( v.length != 3 ){
				return;
			}

			v[1] = ('000'+v[1]).substr(-2);
			v[2] = ('000'+v[2]).substr(-2);
			v = v.join('-')
		}
		this.setData({
			recordDate:v
		})
	},
	switchType:function(e){
		var type = e.target.dataset.type;
		if( this.data.type != type ){
			this.setData({
				type:type,
				tags: this.tags[type],
				selectedTag: this.tags[type][0]
			})
		}
	}
})