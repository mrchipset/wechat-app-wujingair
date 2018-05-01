// pages/info/info.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');
var wxCharts = require('../../utils/wxcharts.js');
var concentsChart = null;
var dailyChangeChart = null;
var weeklyChangeChart = null;
var monthlyChangeChart = null;

var touchDot = 0;
var touchMove = 0;
var touchTime = 0;
var touchInterval = undefined;

Page({
  data: {
    userInfo: {},
    windowSize: [],
    weatherData: {},
    weatherIcon: 'Sunny',
    airData: {},
    current: 0,
    chartTitle: '实时污染物浓度',
    isMainChartDisplay: true
  },


  onLoad: function () {
    const that = this;
    const airData = wx.getStorageSync('airData');
    wx.removeStorageSync('airData');
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo,
      airData: airData
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
    const that = this;
    const airData = that.data.airData;
    //that.nextPage();
    //that.lastPage();
    that.onPageChanged();
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
    const windowSize = that.data.windowSize;
    const airData = that.data.airData;
    switch (that.data.current) {
      case 0:
        that.plotConcents(windowSize[1] * 0.8, windowSize[0] * 0.33, 'canvas1', airData);
        that.plotDailyChanges(windowSize[1] * 0.8, windowSize[0] * 0.33, 'canvas2', airData);
        break;
      case 1:
        that.plotWeeklyChanges(windowSize[1] * 0.8, windowSize[0] * 0.33, 'canvas1', airData);
        that.plotMonthlyChanges(windowSize[1] * 0.8, windowSize[0] * 0.33, 'canvas2', airData);
        break;
      case 2:
      
        break;
    }
    
  },
  
  plotConcents: function (width, height, canvasId, airData){
    concentsChart = new wxCharts({
      canvasId: canvasId,
      type: 'column',
      animation: true,
      categories: ['甲醛', 'PM1.0', 'PM2.5', 'PM10'],
      series: [{
        name: '污染物种类',
        data: airData.Concent,
        format: function (val, name) {
          return val.toFixed(0);
        }
      }],
      yAxis: {
        format: function (val) {
          return val;
        },
        title: '污染物浓度（微克/立方米）',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 30
        }
      },
      width: width,
      height: height,
    });
  },


  plotDailyChanges: function(width, height, canvasId, airData){
    const date = new Date();
    var now = date.getHours()-1;
    var categories = [];
    while(now >= 0){
      categories.unshift('当日' + now + ':00');
      now--;
    }
    now = 23;
    while (now > date.getHours()-1){
      categories.unshift('昨日' + now + ':00');
      now--;
    }

    dailyChangeChart = new wxCharts({
      canvasId: canvasId,
      type: 'line',
      categories: categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '过去24小时AQI指数变化',
        data: airData.History.daily,
        format: function (val, name) {
          return val.toFixed(0);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'AQI指数',
        format: function (val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: width,
      height: height,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },


  plotWeeklyChanges: function (width, height, canvasId, airData){
    const date = new Date();
    var now = date.getDay()-1;
    var weekday = new Array(7);
    weekday[0] = "周日";
    weekday[1] = "周一";
    weekday[2] = "周二";
    weekday[3] = "周三";
    weekday[4] = "周四";
    weekday[5] = "周五";
    weekday[6] = "周六";
    var categories = [];
    while (now >= 0) {
      categories.unshift(weekday[now]);
      now--;
    }
    now = 6;
    while (now > date.getDay()-1) {
      categories.unshift(weekday[now]);
      now--;
    }

    weeklyChangeChart = new wxCharts({
      canvasId: canvasId,
      type: 'line',
      categories: categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '过去7天AQI指数变化',
        data: airData.History.weekly,
        format: function (val, name) {
          return val.toFixed(0);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'AQI指数',
        format: function (val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: width,
      height: height,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },


  plotMonthlyChanges: function (width, height, canvasId, airData) {
    const date = new Date();
    var now = date.getMonth()-1;
    var months = new Array(12);
    months[0] = "一月";
    months[1] = "二月";
    months[2] = "三月";
    months[3] = "四月";
    months[4] = "五月";
    months[5] = "六月";
    months[6] = "七月";
    months[7] = "八月";
    months[8] = "九月";
    months[9] = "十月";
    months[10] = "十一月";
    months[11] = "十二月";
    var categories = [];
    while (now >= 0) {
      categories.unshift(months[now]);
      now--;
    }
    now = 11;
    while (now > date.getMonth()-1) {
      categories.unshift(months[now]);
      now--;
    }

    monthlyChangeChart = new wxCharts({
      canvasId: canvasId,
      type: 'line',
      categories: categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '过去12月AQI指数变化',
        data: airData.History.monthly,
        format: function (val, name) {
          return val.toFixed(0);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'AQI指数',
        format: function (val) {
          return val.toFixed(0);
        },
        min: 0
      },
      width: width,
      height: height,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  }

  

})
