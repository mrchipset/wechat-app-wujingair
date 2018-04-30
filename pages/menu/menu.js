// pages/menu/menu.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');
const chartUtil = require('../../utils/chart.js');
const sensorUtil = require('../../utils/sensor.js');
var touchDot = 0;
var touchMove = 0;
var touchTime = 0;
var touchInterval = undefined;

Page({
  data: {
    userInfo: {},
    windowSize: [],
    weatherData: {},
    bgClass: '',
    airData:[
      {
        Did: '00001',
        Dtype: 'Light-01',
        State: 0,
        AutoRun: {
          on: undefined,
          off: undefined
        },
        Users: undefined,
        AQI: 50,
        Tem: 23,
        Hum: '20%',
        Concent:[
          {
            tag: '甲醛',
            value: 2
          },
          {
            tag: 'PM1.0',
            value: 31
          },
          {
            tag: 'PM2.5',
            value: 31
          },
          {
            tag: 'PM10',
            value: 45
          },
          {
            tag: 'TVOC',
            value: 34
          },
          {
            tag: 'VOC',
            value: 29
          }
        ],
        Loc: '上海理工大学第二学生公寓',
        History: {
          daily: [20, 30, 45, 60, 50, 23, 62, 44, 90, 120, 65, 25, 88, 55, 14, 72, 80, 76, 40, 20, 15, 20, 36, 37],
          weekly: [57, 68, 50, 44, 38, 36, 18]
        }
      }
    ],
    current: 0
  },

  onLoad: function () {
    const that = this;
    var airData = that.data.airData;
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo
    });
    weatherUtil.getWeather(function (res) {
      that.setData({
        weatherData: res
      });
     weatherUtil.getBgImage(airData[that.data.current].AQI, function (res) {
        that.setData({
          bgClass: res.bgImage
        });
        wx.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: res.topColor
        });
      });
    });
  

    var airData = that.data.airData;
    var current = that.data.current;
    wx.connectSocket({
      url: 'ws://wujingair.com:12345'
    });
    wx.onSocketOpen(function (){ 
      console.info('Websocket Connected.');
      app.globalData.socketConnected = true;
    });
    wx.onSocketError(function (){
      console.error('WebSocket Error.');
    });
    wx.onSocketClose(function (){ 
      console.info('Websocket Closed.');
      app.globalData.socketConnected = false;
      try{
        wx.connectSocket({
          url: 'ws://wujingair.com:12345'
        });
      }catch(e){
        console.error(e);
      }
    });
    wx.onSocketMessage(function(res){
      console.log(res);
      that.setData({
        airData: sensorUtil.updateAirData(airData, res.data, current)
      });
      chartUtil.verticalBar('dataBar', airData[current].Concent);
    });
    
    
  },


  onReady: function () {
    const that = this;
    const airData = that.data.airData;
    chartUtil.verticalBar('dataBar', airData[0].Concent);
  },

  onSwiperChanged: function(e) {
    const that = this;
    const current = e.detail.current;
    const airData = that.data.airData;
    that.setData({
      current: current
    });
    for (var i = 0; i < airData.length; i++) {
      const ctx = wx.createCanvasContext('dataBar' + i);
      ctx.draw();
    }
    chartUtil.verticalBar('dataBar', airData[current].Concent);
  },


  touchStart: function(e){
    touchDot = e.touches[0].x;
    touchInterval = setInterval(function () {
      touchTime++;
    }, 100); 
  },

  touchMove: function (e) {
    touchMove = e.touches[0].x;
  },

  touchEnd: function () {
    const that = this;
    const current = that.data.current;
    const airData = that.data.airData;
    if (touchMove - touchDot <= -100 && touchTime < 10) {
      if (current < airData.length - 1) {
        that.setData({
          current: current + 1
        });
      }
    }
    if (touchMove - touchDot >= 100 && touchTime < 10) {
      if (current > 0) {
        that.setData({
          current: current - 1
        });
      }
    }
    clearInterval(touchInterval);
    touchTime = 0; 
  },
  

  openSettings: function(){
    const that = this;
    const current = that.data.current;
    wx.showActionSheet({
      itemList: [
        '详细信息'
      ],
      success: function(e){
        switch (e.tapIndex) {
          case 0:
            wx.navigateTo({
              url: '../info/info?airDataKey=' + current
            });
            break;
        }
      }
    });
  }
})
