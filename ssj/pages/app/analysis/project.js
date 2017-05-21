let app = getApp();

let http = require('../../../utils/http')
let utils = require('../../../utils/util')

Page({
	data:{
		flow:[],
		project:"",
		total: "--"
	},

	project:null,

	onLoad:function (options) {
		let project = options.project;
		if( !project ){
			return wx.navigateBack()
		}
		this.project = project
		this.setData({project:project})

		this.fetchSummary()
		this.fetchFlow()
	},

	fetchSummary:function () {
		http.get({
			url:'/project/total',
			data:{project: this.project},
			success:data=>this.setData({total: data}),
			error:msg=>this.setData({total:msg})
		}, app)
	},

	fetchFlow:function () {
		http.get({
			url:'/project/flow',
			data:{project: this.project},
			success:data=>this.renderFlow(data)
		}, app)
	},

	renderFlow:function(flowList) {
		if( !flowList || !flowList.length ) return[];

    	let temp = {};
    	let result = [];

    	flowList.forEach( item => {
    		if( !temp[item.recordDate] ) {
    			temp[item.recordDate] = { items:[], payout:0, income:0, time:item.recordDate };
    			result.push( temp[item.recordDate] );
    		}

    		let recordData = temp[item.recordDate];

    		recordData.items.push( item );

    		if( item.type == 'payout'){
	    		recordData.payout = utils.toFixed(recordData.payout*1 + item.money*1);
    		}
    		if( item.type == 'income'){
    			recordData.income = utils.toFixed(recordData.income*1 + item.money*1)
    		}
    	})

    	this.setData({flow: result});
	}
})