// pages/menu/menu.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');
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
    bgColor: '',
    settingMenuShown: false,
    airData:[
      {
        Did: '00001',
        Dtype: 'Light-01',
        systemOn: false,
        automodeOn: false,
        windlevel: 50,
        oxygenlevel: 50,
        AutoRun: {
          on: undefined,
          off: undefined
        },
        Users: undefined,
        AQI: 43,
        Tem: 23,
        Hum: '20%',
        Concent:[2, 31, 31, 44],
        Loc: '上海理工大学第二学生公寓',
        History: {
          daily: [20, 30, 45, 60, 50, 23, 62, 44, 90, 120, 65, 25, 88, 55, 14, 72, 80, 76, 40, 20, 15, 20, 36, 37],
          weekly: [57, 68, 50, 44, 38, 36, 18],
          monthly: [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, 60, 58, 46, 48]
        }
      },
      {
        Did: '00002',
        Dtype: 'Light-01', 
        systemOn: true,
        automodeOn: false,
        windlevel: 60,
        oxygenlevel: 40,
        AutoRun: {
          on: undefined,
          off: undefined
        },
        Users: undefined,
        AQI: 79,
        Tem: 23,
        Hum: '20%',
        Concent: [5, 25, 38, 40],
        Loc: '上海理工大学第二学生公寓',
        History: {
          daily: [20, 30, 45, 60, 50, 23, 62, 44, 90, 120, 65, 25, 88, 55, 14, 72, 80, 76, 40, 20, 15, 20, 36, 37],
          weekly: [57, 68, 50, 44, 38, 36, 18],
          monthly: [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, 60, 58, 46, 48]
        }
      }
    ],
    current: 0
  },


  onLoad: function () {
    const that = this;
    var airData = that.data.airData;
    var current = that.data.current;
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo
    });
    that.updateBackground();

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

      /*
      that.setData({
        airData: sensorUtil.updateAirData(airData, res.data, current)
      });
      */
    });
    
    
  },


  onSwiperChanged: function(e) {
    const that = this;
    const current = e.detail.current;
    const airData = that.data.airData;
    that.setData({
      current: current
    });

    that.updateBackground();
  },


  touchStart_Canvas: function(e){
    touchDot = e.touches[0].x;
    touchInterval = setInterval(function () {
      touchTime++;
    }, 100); 
  },

  touchMove_Canvas: function (e) {
    touchMove = e.touches[0].x;
  },

  touchEnd_Canvas: function () {
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


  touchStart_Menu: function (e) {
    touchDot = e.touches[0].pageY;
    touchInterval = setInterval(function () {
      touchTime++;
    }, 100);
  },

  touchMove_Menu: function (e) {
    touchMove = e.touches[0].pageY;
  },

  touchEnd_Menu: function () {
    const that = this;
    const settingMenuShown = that.data.settingMenuShown;
    if (touchMove - touchDot <= -100 && touchTime < 10) {
      that.setData({
        settingMenuShown: true
      });
    }
    if (touchMove - touchDot >= 100 && touchTime < 10) {
      that.setData({
        settingMenuShown: false
      });
    }
    clearInterval(touchInterval);
    touchTime = 0;
  },


  updateBackground: function(){
    const that = this;
    var airData = that.data.airData;
    var current = that.data.current;
    weatherUtil.getWeather(function (res) {
      that.setData({
        weatherData: res
      });
      weatherUtil.getBgImage(airData[current].AQI, function (res) {
        that.setData({
          bgColor: res.bgColor
        });
        wx.setNavigationBarColor({
          frontColor: "#ffffff",
          backgroundColor: res.bgColor
        });
      });
    });
  },
  
  
  openDetailsPage: function(){
    const that = this;
    const airData = that.data.airData;
    const current = that.data.current;
    wx.setStorageSync('airData', airData[current]);
    if (wx.getStorageInfoSync('airData')){
      wx.navigateTo({
        url: '../info/info'
      });
    }
  },


  onSystemSwitchChanged: function () {
    const that = this;
    const current = that.data.current;
    var airData = that.data.airData;
    airData[current].systemOn = !airData[current].systemOn;
    that.setData({
      airData: airData
    });
    const socketConnected = app.globalData.socketConnected;
    if (socketConnected) {
      wx.sendSocketMessage({
        data: JSON.stringify(
          {
            wx_id: 'my_wx_id',
            protocol: "func",
            tcp_id: "wujing-air-B123",
            func: airData[current].systemOn ? "off" : "on",
            params: 2
          }
        ),
        success: function () {
          console.info("SystemOn: " + !airData[current].systemOn);
        }
      });
    }
    if (!airData[current].systemOn){
      airData[current].automodeOn = false;
      that.setData({
        airData: airData
      });
    }
  },


  onAutomodeSwitchChanged: function () {
    const that = this;
    const current = that.data.current;
    var airData = that.data.airData;
    if(airData[current].systemOn){
      airData[current].automodeOn = !airData[current].automodeOn;
      that.setData({
        airData: airData
      });
    }
  },


  onWindlevelChanged: function (res) {
    const that = this;
    const current = that.data.current;
    var airData = that.data.airData;
    const windlevel = res.detail.value;
    airData[current].windlevel = windlevel;
    that.setData({
      airData: airData
    });
    const socketConnected = app.globalData.socketConnected;
    if (socketConnected) {
      var para = 0;
      if (windlevel == 0) {
        para = 0;
      } else if (windlevel > 0 && windlevel <= 33) {
        para = 1;
      } else if (windlevel > 33 && windlevel <= 67) {
        para = 2;
      } else {
        para = 3;
      }
      wx.sendSocketMessage({
        data: JSON.stringify(
          {
            wx_id: 'my_wx_id',
            protocol: "func",
            tcp_id: "wujing-air-B123",
            func: "speed",
            params: para
          }
        ),
        success: function () {
          console.info("Windlevel: " + para);
        }
      });
    }
  },


  onOxygenlevelChanged: function (res) {
    const that = this;
    const current = that.data.current;
    var airData = that.data.airData;
    airData[current].oxygenlevel = res.detail.value;
    that.setData({
      airData: airData
    });
  }
})
