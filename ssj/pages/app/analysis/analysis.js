var app = getApp();

var Line = require('../../../utils/line.js');
var Bar = require('../../../utils/bar.js');
var utils = require('../../../utils/util.js')
var http = require('../../../utils/http')

Page({
	data:{
		ctxHeight: 400,
		flow:[],
		tagData: null,
		yearPayout:0,
		yearIncome:0,

		lineCtxHeight: 400,
		ctxtype:"rate",
		oneDayData: {},

		mlineCtxHeight: 400,
		oneMonthData: {}

		,selYear: 0
		,selMonth:0,
		showNextMonthIcon:false

		,monthTotalPayout:0
		,noData:false

		,projects:[]
	},
	lineCtx:null,
	mlineCtx: null,
	barCtx: null,

	onReady:function(){
        wx.setNavigationBarTitle({title:"统计"})
    },

	onLoad:function() {
		this.setData({
			curYear:app.globalData.year,
			selYear: app.globalData.year,
			selMonth:app.globalData.month
		})
		this.getYearSummary()
		this.getMonthData( flowList =>this.drawCtx(flowList));
		// this.getLastYearData() //1年数据，画月支出趋势图
		this.fetchProjects()
	},

	drawCtx:function(flowList){
		// 占比
		let bar = this.drawBar(flowList)
		this.barCtx = bar;

		// 走势
		let line = this.drawLine(flowList)
		this.lineCtx = line;
	},

	switchCtx:function(e){
		this.setData({ctxtype:e.target.dataset.ctxtype});
	},

	/**
	 * 一年数据，按月汇总
	 * @return {[type]} [description]
	 */
	getLastYearData:function () {
		let start; //上一年
		let end; //上个月

		let month = app.globalData.month;
		month = '0'+ month;
		month = month.substr(-2);
		let year = app.globalData.year;

		start = [year, month, '00'].join('-')
		end = [--year, month, '00'].join('-')

		http.get({
			url:'/record/permonthpayout/',
			data:{
				start: start,
				end:end
			},
			success:data=>{

			}
		}, app)
	},

	lastMonth:function(){
		let month = this.data.selMonth*1;
		let year = this.data.selYear*1;

		if( month <= 1){
			month = 12;
			year--
			this.getYearSummary( year )
		}else{
			month--;
		}
		this.setData({selMonth:month, selYear:year, showNextMonthIcon:true, flow:[], tagData:null, oneDayData:{}})
		this.getMonthData( flowList =>this.drawCtx(flowList), year, month);
	},

	nextMonth:function(){
		if( !this.data.showNextMonthIcon )return;
		let month = this.data.selMonth*1;
		let year = this.data.selYear*1;

		if( month >= 12){
			month = 1;
			year++;
			this.getYearSummary( year )
		}else{
			month++
		}

		let showNextMonthIcon = [app.globalData.year, app.globalData.month].join('-') > [year, month].join('-')
		this.setData({selMonth:month, selYear:year, showNextMonthIcon:showNextMonthIcon, flow:[],tagData:null, oneDayData:{}})
		this.getMonthData( flowList =>this.drawCtx(flowList), year, month);
	},

	getYearSummary:function(year){

		let query = {}
		!!year && (query.year = year);

		http.get({
            url: '/record/year/summary',
            data: query,
            success:data=>{
                if(data&&data.length){

                	data.forEach( d=>{
                		if( d.type =='payout'){
	                    	this.setData({yearPayout:d.money})
                		}else{
                			this.setData({yearIncome:d.money})
                		}
                	})
                }
            },
            error:msg=>{
            	wx.showModal({
		            title: '警告',
		            content: '获取年度数据失败',
		            showCancel:false
		        })
            }
        }, app)
	},

	getMonthData:function(cb, year, month){
		
        http.post({
            url: '/record/monthlist',
            data: {
                month: month||this.data.selMonth,
                year: year||this.data.selYear
            },
            success:data=>{

            	// 有数据才画图
                if(data && data.length){
                	this.setMonthTotalPayout(data);
                	cb && cb(data)
                	this.setData({"noData":false})
                }else{
                	this.setData({"noData":true})
                }
            },
            error:e=>{
            	wx.showModal({
		            title: '警告',
		            content: '获取月度数据失败',
		            showCancel:false
		        })
            }
        }, app)
	},

	setMonthTotalPayout:function(flowList){
		var t = 0;

		if( !flowList || !flowList.length ){ 
			this.monthTotalPayout = 0;
			this.setData({monthTotalPayout:0})
			return 0;
		}

		flowList.forEach(item=>{
			if( item.type == 'payout'){
				t = t+item.money*1
			}
		})

		t = utils.toFixed(t)

		this.setData({monthTotalPayout: t})
		this.monthTotalPayout = t;
	},

	calLineData:function( flowList ){
    	if( !flowList || !flowList.length ) return[];

    	var temp = {};
    	var result = [];

    	var maxDate = '01'

    	flowList.forEach( item => {
    		if( !temp[item.recordDate] ) {
    			temp[item.recordDate] = { items:[], payout:0, income:0, time:item.recordDate };
    			result.push( temp[item.recordDate] );
    		}

    		var recordData = temp[item.recordDate];

    		recordData.items.push( item );

    		if( item.type == 'payout'){
	    		recordData.payout = recordData.payout*1 + item.money*1;
	    		recordData.payout = utils.toFixed( recordData.payout )
    		}else{
    			recordData.income = recordData.income*1 + item.money*1;
	    		recordData.income = utils.toFixed( recordData.income )
    		}

    		let txt = item.recordDate.split('-')
			let t = recordData.txt = txt.pop();

			if( t>maxDate){maxDate=t}
    	})

    	let stop = Math.max(app.globalData.date, maxDate*1);
    	for(let i=1;i<=stop;i++){
    		let hasData = result.find(r=>r.txt*1==i)
    		if( !hasData ){
    			result.push({
    				items:[], 
    				payout:0, 
    				income:0, 
    				txt: ("000"+i).substr(-2),
    			})
    		}
    	}
		result.sort((a,b)=>a.txt>b.txt?1:-1)
    	return result;
	},

	calMLineData:function (perMonthPayout) {
			
	},

	calTagRateData:function( flowList){
		var ret = {}

		flowList.forEach( item=>{
			if( item.type != 'payout')return;

			ret[item.tag] = ret[item.tag]||{value:0, records:[]};

			ret[item.tag].value = ret[item.tag].value+item.money*1;
			ret[item.tag].records.push( item )
		})

		var temp = [];
		for(var tag in ret){
			let r = Math.floor( (ret[tag].value*10000)/this.monthTotalPayout ) /100;
			temp.push({
				tag: tag,
				value: ret[tag].value,
				items: ret[tag].records,
				rate: r
			})
		}

		return temp;
	},

	renderRecords:function( flowList ){
		if( !flowList || !flowList.length ) return[];

    	var temp = {};
    	var result = [];

    	flowList.forEach( item => {
    		if( !temp[item.recordDate] ) {
    			temp[item.recordDate] = { items:[], payout:0, income:0, time:item.recordDate };
    			result.push( temp[item.recordDate] );
    		}

    		var recordData = temp[item.recordDate];

    		recordData.items.push( item );

    		if( item.type == 'payout'){
	    		recordData.payout = utils.toFixed(recordData.payout*1 + item.money*1);
    		}
    	})

    	this.setData({flow: result});
	},


	// 画线图
	drawLine:function(flowList){
		let data = this.calLineData( flowList )

		if( !data||!data.length )return;

		data = data.map(d=>{ 
			d.value = d.payout
			return d;
		})
		var line = new Line()
		line.draw({
			renderTo: 'lineCanvas',
			series: data,
			setCanvasSize: o=>this.setData({lineCtxHeight:o.height}),
			onTouch: e=>this.setData({ oneDayData: e.serie })
		})

		return line;
	},

	drawMLine:function (perMonthPayout) {
		let data = this.calMLineData(perMonthPayout)

		if( !data||!data.length )return;

		var line = new Line()
		line.draw({
			renderTo: 'mlineCanvas',
			series: data,
			setCanvasSize: o=>this.setData({mlineCtxHeight:o.height}),
			onTouch: e=>this.loadMonthFlow(e.serie)
		})
		return line;
	},

	touchlineCanvas:function(e){
		return this.lineCtx.onTouch(e);
	},

	touchmovelineCanvas:function(e){
		return this.lineCtx.onTouchMove(e);
	},

	touchlineCanvasEnd:function(e){return this.lineCtx.onTouchEnd(e)},


	// 画柱状图
	drawBar:function(flowList){
		let data = this.calTagRateData(flowList);
		if( !data || !data.length)return;
		
		let bar = new Bar();
		bar.draw({
			renderTo:"tagRateCanvas",
			series:data,
			setCanvasSize: o=>this.setData({ctxHeight:o.height}),
			onTouch:(e)=>{
				let serie = e.serie
				this.renderRecords(serie.items)

				this.setData({tagData: {
					tag: serie.tag,
					value: utils.toFixed(serie.value),
					rate: serie.rate
				}})
			}
		})

		return bar;
	},

	touchTagRateCanvas:function(e){
		return this.barCtx.onTouch(e);
	},

	end:function(e){return this.barCtx.onTouchEnd(e)},


	/**
	 * 有专项才显示专项
	 * @return {[type]} [description]
	 */
	fetchProjects:function() {
		if( app.globalData.projects ){
			this.setData({projects: app.globalData.projects})
		}else{
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

            		// projects = ['装修', '爸妈医疗', '买房', '车', '孩子培训班', '学唱歌','研究生', '考试', '2017年去日本']

                	this.setData({	
                		projects: projects
                	})

                	app.globalData.projects = projects;
                }
			}, app)
		}
	}

})