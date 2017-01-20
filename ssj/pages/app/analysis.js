var app = getApp();

var Line = require('../../utils/line.js');
var Bar = require('../../utils/bar.js');

Page({
	data:{
		ctxHeight: 400,
		flow:[],
		tagData: null,
		yearPayout:0,
		yearIncome:0,

		lineCtxHeight: 400,
		ctxtype:"rate",
		oneDayData: {}

		,selYear: 0
		,selMonth:0,
		showNextMonthIcon:false

		,monthTotalPayout:0
		,noData:false
	},
	lineCtx:null,
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
		wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 10000,
          mask:true
        })

		let query = {
            openid: app.globalData.openid,
		}
		!!year && (query.year = year);

		wx.request({
            url: app.globalData.settings.host+'/record/year/summary',
            data: query,
            method:"GET",
            success:res=>{
                if( res.statusCode != 200)return;
                
                var data = res.data;

                if( data.code == 0 ){
                    if(data.data&&data.data.length){

                    	data.data.forEach( d=>{
                    		if( d.type =='payout'){
		                    	this.setData({yearPayout:d.money})
                    		}else{
                    			this.setData({yearIncome:d.money})
                    		}
                    	})
                    }
                }else{
                	wx.showModal({
			            title: '警告',
			            content: '获取年度数据失败',
			            showCancel:false
			        })
                }
            },
            fail:e=>{
            	wx.showModal({
		            title: '警告',
		            content: '获取年度数据失败',
		            showCancel:false
		        })
            },
            complete:e=>{wx.hideToast();}
        })
	},

	getMonthData:function(cb, year, month){
		wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 10000,
          mask:true
        })
        wx.request({
            url: app.globalData.settings.host+'/record/monthlist',
            data: {
                openid: app.globalData.openid,
                month: month||this.data.selMonth,
                year: year||this.data.selYear
            },
            method:"POST",
            success:res=>{
                if( res.statusCode != 200)return;
                
                var data = res.data;

                if( data.code == 0 ){
                	// 有数据才画图
                    if(data.data && data.data.length){
                    	this.setMonthTotalPayout(data.data);
                    	cb && cb(data.data)
                    	this.setData({"noData":false})
                    }else{
                    	this.setData({"noData":true})
                    }
                }else{
                	wx.showModal({
			            title: '警告',
			            content: '获取月度数据失败',
			            showCancel:false
			        })
			        this.setData({"noData":true})
                }
            },
            fail:e=>{
            	wx.showModal({
		            title: '警告',
		            content: '获取月度数据失败',
		            showCancel:false
		        })
            },
            complete:e=>wx.hideToast()
        })
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
    		}else{
    			recordData.income = recordData.income*1 + item.money*1;
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
	    		recordData.payout = recordData.payout*1 + item.money*1;
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
					value: serie.value,
					rate: serie.rate
				}})
			}
		})

		return bar;
	},

	touchTagRateCanvas:function(e){
		return this.barCtx.onTouch(e);
	},

	end:function(e){return this.barCtx.onTouchEnd(e)}

})