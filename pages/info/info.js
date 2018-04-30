// pages/info/info.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');
const chartUtil = require('../../utils/chart.js');
var touchDot = 0;
var touchMove = 0;
var touchTime = 0;
var touchInterval = undefined;

var airDatas = [
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
    Concent: [
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
];

Page({
  data: {
    userInfo: {},
    windowSize: [],
    weatherData: {},
    weatherIcon: 'Sunny',
    airData: {},
    current: 0
  },


  onLoad: function (options) {
    const that = this;
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo,
      airData: airDatas[options.airDataKey]
    });

    weatherUtil.getWeather(function (res) {
      that.setData({
        weatherData: res
      });
      weatherUtil.getWeatherIcon(that.data.weatherData, function (res) {
        that.setData({
          weatherIcon: res.weatherIcon
        });
      });
    });
  },


  onReady: function () {
    this.nextPage();
    this.lastPage();
    //this.onPageChanged();
  },

  touchStart: function (e) {
    touchDot = e.touches[0].y;
    touchInterval = setInterval(function () {
      touchTime++;
    }, 100);
  },

  touchMove: function (e) {
    touchMove = e.touches[0].y;
  },

  touchEnd: function () {
    const that = this;
    const current = that.data.current;
    const airData = that.data.airData;
    if (touchMove - touchDot <= -100 && touchTime < 10) {
      if (current < 2) {
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
    that.onPageChanged();
  },

  lastPage: function() {
    this.setData({
      current: this.data.current - 1
    });
    this.onPageChanged();
  },

  nextPage: function () {
    this.setData({
      current: this.data.current + 1
    });
    this.onPageChanged();
  },

  onPageChanged: function(){
    const that = this;
    const current = that.data.current;
    const airData = that.data.airData;
    const ctx = wx.createCanvasContext('canvas');
    switch (that.data.current) {
      case 0:
        chartUtil.topLine('canvas', airData.History.daily, '过去24小时AQI变化情况');
        chartUtil.bottomBar('canvas', airData.History.weekly, '过去一周AQI变化情况');
        break;
      case 1:
        ctx.draw(); 
        break;
      case 2:
        ctx.draw(); 
        break;
    }
  }
  
})
