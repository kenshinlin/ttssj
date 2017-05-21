var app = getApp();
var utils = require('../../utils/util')
var http = require('../../utils/http')

Page({
    data:{
    	username: null,
    	month: null,
        budget:0,
        budgetBalance: 0,
        totalIncome: 0,
        totalPayout: 0,
        flow:[],
        year:null,
        budgetModalHidden:true,
        budgetInput:0,
        complete: false,
        init:false
    },

    onReady:function(){
        wx.setNavigationBarTitle({title:"记账记录"})
    },

    onPullDownRefresh:function(){
        this.requestFlowData(()=>wx.stopPullDownRefresh());
    },
    onReachBottom:function(){
        !this.data.complete && this.requestFlowData()
    },


    fetchingMonth: null,
    fetchingYear: null,

    calFlowData:function(flowList){

    	if( !flowList || !flowList.length ) {return this.setData({flow:[]})}

    	var temp = {};
    	var result = [];

    	// 这个可以不要
    	// flowList.sort( (a,b) => a.recordDate<=b.recordDate?1:-1 );

    	flowList.forEach( item => {
    		if( !temp[item.recordDate] ) {
    			temp[item.recordDate] = { items:[], payout:0, income:0, time:item.recordDate };
    			result.push( temp[item.recordDate] );
    		}

    		var recordData = temp[item.recordDate];

    		recordData.items.push( item );

    		if( item.type == 'payout'){
	    		recordData.payout = recordData.payout*1 + item.money*1;
                recordData.payout = utils.toFixed(recordData.payout)
            }else{
                recordData.income = recordData.income*1 + item.money*1;
                recordData.income = utils.toFixed(recordData.income)
    		}
    	})

    	this.setData({flow: result});
    },

    touchDownItemTime:null,
    touchItemMoved: false,
    onFlowItemTouchStart:function(e){
        this.touchDownItemTime = +new Date;
        this.touchItemMoved = false;
        this.touchDownItemPoint = [e.touches[0].pageX, e.touches[0].pageY];
    },

    onFlowItemTouchMove:function(){
        this.touchItemMoved = true;
    },


    onFlowItemTouchEnd:function(e){
        var now = +new Date;

        var touchTime = now - this.touchDownItemTime;
        var isLongTouch = touchTime>100


        if( !isLongTouch && !this.touchItemMoved ){
            this.editRecord(e)
        }

    },

    editRecord:function(e){
    	var md5 = e.currentTarget.dataset.mdfive;

        if( md5 ){
        	wx.navigateTo({
        		url:"./editor/editor?md5="+md5
        	})
        }
    },

    confirmdelRecord:function(e){
        var md5 = e.currentTarget.dataset.mdfive;

        if( !md5 )return;

        wx.showModal({
            title: '警告',
            content: '删除此记录吗',
            success: res=>{
                if (res.confirm) {
                    // console.log('用户点击确定')
                    this.delRecord(md5)
                }
            }
        })
    },


    delRecord:function(md5){
        this.delRemoteData(md5);
        this.delLocalData(md5);
    },

    addRecord:function(){
    	wx.navigateTo({
	      	url: './editor/editor'
	    })
    },

    delRemoteData:function(md5){
        var that = this;

        console.warn('删除', {md5:md5, openid: app.globalData.openid});

        http.post({
            url: '/record/del',
            data: {md5:md5},
            success:data=>{}
        },app)
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
            // wx.setStorageSync('flowlist', newData);
            app.globalData.flowList = newData;
            this.formatData(newData);

        }catch(e){
            console.log('删除一个记账失败', md5, e.message)
            return false
        }
        
    },


    showAnalysis:function(){
        wx.navigateTo({
            url:"./analysis/analysis"
        })
    },

    showActionSheet:function(){
        let actions = ['分享', '设置预算', '帮助和意见反馈']

        wx.showActionSheet({
            itemList: actions,
            success:res=>{
                switch (res.tapIndex)
                {
                    case 0:
                    case 2:
                        wx.navigateTo({
                            url: '/pages/about/index?action='+actions[res.tapIndex]
                        })
                        break
                    case 1:
                        this.showBudgetModal()
                        break
                }
            }
        }) 
    },

    showBudgetModal:function(){
        this.setData({budgetModalHidden:false});
    },

    hideBudgetModal:function(){
        this.setData({budgetModalHidden:true});
    },

    setBudget:function(){
        var budgetInput = this.data.budgetInput

        wx.setStorage({
            key:'budget',
            data:budgetInput
        }) 
        app.globalData.budget = budgetInput;
        this.hideBudgetModal()

        this.setData({
            budget:budgetInput,
            budgetBalance: utils.toFixed(budgetInput*1 - this.data.totalPayout)
        })

        wx.showToast({
            title: '预算修改成功',
            icon: 'success',
            duration: 1000
        })
    },

    budgetInputChange:function(e){
        this.setData({
            budgetInput: e.detail.value
        })
    },

    calThisMonthTotalIncomeAndPayout:function(flowList){
    	var totalPayout=0, totalIncome=0;
    	
    	var month = this.data.month*1;
        var year = this.data.year*1;

    	if(flowList && flowList.length ){

    		flowList.forEach( item => {
    			var recordDate = item.recordDate||"";

    			recordDate = recordDate.split('-');
    			if( recordDate.length < 3)return;
                var recordMonth = recordDate[1]*1;
    			var recordYear = recordDate[0]*1;

                if( month != recordMonth )return;
    			if( year != recordYear )return;

    			if( item.type == 'income' ){	
    				totalIncome = totalIncome+item.money*1
    			}else{
    				totalPayout = totalPayout+item.money*1
    			}
    		})
    	}

    	this.setData({
			totalIncome: utils.toFixed(totalIncome),
			totalPayout: utils.toFixed(totalPayout),
			budgetBalance: utils.toFixed( app.globalData.budget - totalPayout)
		})
    },

    formatData:function(flowList){
    	this.calThisMonthTotalIncomeAndPayout(flowList)
    	this.calFlowData(flowList);
    },

    // @TODO 继续 
    onShow:function(){
    	this.formatData( app.globalData.flowList );
        
        // this.setData({complete:false});
        // this.loadFirstScreenData();
    },

    // todo 多一个 onshow
    onLoad:function () {
        app.initUserInfo(e=>{
            this.loadFirstScreenData()
        })
    },

    loadFirstScreenData:function(){
        var globalData = app.globalData||{}
        var userInfo = globalData.userInfo||{}

        var localNow = new Date();
        var month = globalData.month||( localNow.getMonth()+1);
        var year = globalData.year||(localNow.getFullYear());

        this.setData({username:userInfo.nickName||"欢迎使用"})
        this.setData({month: month})
        this.setData({year: year})
        this.setData({budget:app.globalData.budget})
        this.setData({budgetInput:app.globalData.budget})


        this.fetchingMonth = month;
        this.fetchingYear = year;

        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 10000,
          mask:true
        })
        this.requestFlowData(e=>{wx.hideToast(); this.setData({init:true})})
    },

    // 同步数据，计算并setData，替换localstorage,setGlobalData
    requestFlowData:function( cb ){

        http.post({
            url: '/record/list',
            data: {
                month: this.fetchingMonth,
                year:this.fetchingYear
            },
            success:data=>{
                var flowList = app.globalData.flowList||[];
                if(data && data.length){
                    // 当月
                    if( this.fetchingMonth == this.data.month && this.fetchingYear==this.data.year){
                        flowList = data;
                    }else{
                        flowList = flowList.concat(data)
                    }
                    app.globalData.flowList = flowList;
                    this.formatData(flowList);

                    let recordDate = data[0].recordDate;
                    recordDate = recordDate.split('-');
                    let recordMonth = recordDate[1]*1;
                    let recordYear = recordDate[0]*1;

                    this.fetchingMonth = --recordMonth;
                    if( this.fetchingMonth < 1){
                        this.fetchingMonth = 12;
                        this.fetchingYear = --recordYear;
                    }
                }else{
                    this.setData({complete:true})
                }
            },
            complete:()=>typeof cb =='function' && cb()
        }, app)
    }
})