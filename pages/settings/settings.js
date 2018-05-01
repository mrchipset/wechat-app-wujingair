// pages/settings/settings.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');

Page({
  data: {
    userInfo: {},
    windowSize: [],
    current: '',
    airData:{},
    systemOn: false,
    automodeOn: false,
    windlevel: 50,
    oxygenlevel: 50
  },


  onLoad: function (options) {
    const that = this;
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo,
      current: options.current
    });
    
  },


  onReady: function () {
    
  },


  onSystemSwitchChanged: function(){
    const that = this;
    const systemOn = that.data.systemOn;
    that.setData({
      systemOn: !systemOn
    });
    const socketConnected = app.globalData.socketConnected;
    if(socketConnected){
      wx.sendSocketMessage({
        data: JSON.stringify(
          {
            wx_id: 'my_wx_id',
            protocol: "func",
            tcp_id: "wujing-air-B123",
            func: systemOn ? "off": "on",
            params: 2
          }
        ),
        success: function(){
          console.info("SystemOn: " + !systemOn);
        }
      });
    }
  },


  onAutomodeSwitchChanged: function() {
    const that = this;
    const automodeOn = that.data.automodeOn;
    that.setData({
      automodeOn: !automodeOn
    });
  },


  onWindlevelChanged: function(res){
    const that = this;
    const windlevel = res.detail.value;
    that.setData({
      windlevel: windlevel
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


  onOxygenlevelChanged: function(res){
    const that = this;
    that.setData({
      oxygenlevel: res.detail.value
    });
  }

  
})
