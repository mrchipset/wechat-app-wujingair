// pages/menu/menu.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');
const pinyinUtil = require('../../utils/pinyin.js');

var touchDot = 0;
var touchMove = 0;
var touchTime = 0;
var touchInterval = undefined;

var timer = null;

function randData(cnt, min, max, n) {
  var res = [];
  for (var i = 0; i < cnt; i++) {
    const rand = Math.random() * (max - min) + min;
    res.push(rand.toFixed(n));
  }
  return res;
};

Page({
  data: {
    userInfo: {},
    windowSize: [],
    weatherData: {},
    bgColor: '#209E85',
    settingMenuShown: false,
    airState: [
      {
        Did: '00001',
        Dtype: 'Light-01',
        systemOn: false,
        automodeOn: false,
        windlevel: 50,
        oxygenlevel: 50,
        Users: undefined,
      },
      /*
      {
        Did: '00002',
        Dtype: 'Light-01',
        systemOn: true,
        automodeOn: false,
        windlevel: 60,
        oxygenlevel: 40,
        Users: undefined,
      }
      */
    ],
    airData: [
      {
        AQI: '--',
        Tem: 23,
        Hum: 20,
        Concent: [2, 31, 31, 44],
        Province: '上海',
        City: '杨浦',
        /*
        History: {
          daily: {
            pm1: randData(24, 40, 120, 0),
            pm2: randData(24, 20, 100, 0),
            pm10: randData(24, 0, 80, 0),
            voc: randData(24, 0, 2, 3)
          },
          weekly: {
            pm1: randData(7, 40, 120, 0),
            pm2: randData(7, 20, 100, 0),
            pm10: randData(7, 0, 80, 0),
            voc: randData(7, 0, 2, 3)
          },
          monthly: {
            pm1: randData(12, 40, 120, 0),
            pm2: randData(12, 20, 100, 0),
            pm10: randData(12, 0, 80, 0),
            voc: randData(12, 0, 2, 3)
          },
          */
        History: {
          daily: {
            pm1: randData(24, 13, 21, 0),
            pm2: randData(24, 20, 28, 0),
            pm10: randData(24, 42, 50, 0),
            voc: randData(24, 0, 0.5, 3)
          },
          weekly: {
            pm1: [18, 27, 13, 47, 40, 63, 54].reverse(),
            pm2: [24, 43, 33, 58, 49, 82, 86].reverse(),
            pm10: [46, 70, 53, 60, 61, 99, 98].reverse(),
            voc: randData(7, 0, 0.5, 3)
          },
          monthly: {
            pm1: [37, 20, 32, 27, 50, 39, 25, 18, 17, 22, 18, 23].reverse(),
            pm2: [41, 42, 41, 44, 58, 54, 42, 24, 26, 31, 33, 38].reverse(),
            pm10: [58, 83, 54, 63, 68, 76, 70, 43, 43, 50, 57, 47].reverse(),
            voc: randData(12, 0, 0.5, 3)
          },
        }
      },

      /*
      {
        AQI: '--',
        Tem: 23,
        Hum: '24',
        Concent: [5, 25, 38, 40],
        Province: '广东',
        City: '广州',
        History: {
          daily: {
            pm1: randData(24, 40, 120, 0),
            pm2: randData(24, 20, 100, 0),
            pm10: randData(24, 0, 80, 0),
            voc: randData(24, 0, 2, 3)
          },
          weekly: {
            pm1: randData(7, 40, 120, 0),
            pm2: randData(7, 20, 100, 0),
            pm10: randData(7, 0, 80, 0),
            voc: randData(7, 0, 2, 3)
          },
          monthly: {
            pm1: randData(12, 40, 120, 0),
            pm2: randData(12, 20, 100, 0),
            pm10: randData(12, 0, 80, 0),
            voc: randData(12, 0, 2, 3)
          },
        }
      }
      */
    ],
    current: 0
  },


  onLoad: function () {
    const that = this;
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo
    });
    const airDataTmp = wx.getStorageSync('airData');
    if (airDataTmp) {
      that.setData({
        airData: airDataTmp
      });
    }
    that.updateAQI(that.data.airData);
    that.updateBackground();
    that.startSocket();
  },


  onShow: function () {
    const that = this;
    var airData = that.data.airData;
    timer = setInterval(function () {
      wx.setStorage({
        key: 'airData',
        data: airData,
      });
      that.updateAQI(airData);
      that.updateBackground();
    }, 5 * 60 * 1000);
  },


  onHide: function () {
    const airData = this.data.airData;
    wx.setStorage({
      key: 'airData',
      data: airData,
    });
  },



  startSocket: function () {
    const wssUrl = 'wss://www.wujingair.com/wss';
    const that = this;
    var airData = that.data.airData;
    function handleData(arr) {
      var pm1 = [];
      var pm2 = [];
      var pm10 = [];
      var voc = [];
      for (var i = 0; i < arr.length; i++) {
        pm1.push(arr.pm1);
        pm2.push(arr.pm2);
        pm10.push(arr.pm10);
        voc.push(arr.voc);
      }
      return {
        pm1: pm1,
        pm2: pm2,
        pm10: pm10,
        voc: voc
      }
    };

    wx.connectSocket({
      url: wssUrl
    });
    wx.onSocketOpen(function () {
      console.info('Websocket Connected.');
      app.globalData.socketConnected = true;
      // login
      wx.sendSocketMessage({
        data: JSON.stringify(
          {
            wx_id: 'my_wx_id',
            protocol: "login",
            tcp_id: "wujing-air-B123"
          }
        ),
        success: function () {
          console.info("Webxocket Login.");
        }
      });
      // update changes
      that.updateChanges();
    });
    wx.onSocketError(function () {
      console.error('WebSocket Error.');
    });
    wx.onSocketClose(function () {
      console.info('Websocket Closed.');
      app.globalData.socketConnected = false;
      try {
        wx.connectSocket({
          url: wssUrl
        });
      } catch (e) {
        console.error(e);
      }
    });
    wx.onSocketMessage(function (res) {
      res = JSON.parse(res.data);
      console.log(res);
      var len = res.length;
      if(len){
        /*
        switch(len){
          case 24:
            airData[1].History.daily = handleData(res);
            break;
          case 7:
            airData[1].History.weekly = handleData(res);
            break;
          case 12:
            airData[1].History.monthly = handleData(res);
            break;
        }
        */
      }else{
        if(res.pm1){
          airData[0].Concent = [
            res.voc,
            res.pm1,
            res.pm2,
            res.pm10
          ];
          airData[0].Tem = res.tem;
          airData[0].Hum = res.hum;
        }
      }
      that.setData({
        airData: airData
      });
      wx.setStorageSync('airData', airData);
    });
  },


  onSwiperChanged: function (e) {
    const that = this;
    const current = e.detail.current;
    const airData = that.data.airData;
    that.setData({
      current: current
    });

    that.updateBackground();
  },


  touchStart_Canvas: function (e) {
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


  updateBackground: function () {
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
        const pages = getCurrentPages();
        if (pages.length == 1) {
          wx.setNavigationBarColor({
            frontColor: "#ffffff",
            backgroundColor: res.bgColor
          });
        }
      });
    });
  },


  updateAQI: function (airData) {
    const that = this;
    console.info('AQI Updating.');
    airData.forEach(item => {
      var provc = item.Province;
      var city = item.City;
      pinyinUtil.str2py(provc, function (res) {
        provc = res.py;
        pinyinUtil.str2py(city, function (res) {
          city = res.py;
          weatherUtil.getAQI(provc, city, function (aqi) {
            item.AQI = aqi;
            console.info(item.Province + ',' + item.City + ': ' + aqi);
            for (var i = 0; i < airData.length; i++) {
              if (airData[i].Did == item.Did) {
                airData[i].AQI = aqi;
              }
              that.setData({
                airData: airData
              });
              wx.setStorage({
                key: 'airData',
                data: airData
              });
              that.updateBackground();
            }
          });
        });
      });
    });
  },



  updateChanges: function () {
    const that = this;
    var airData = that.data.airData;
    const period = ['day', 'week', 'month'];
    function firstUpper(str) {
      return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    period.forEach(item => {
      wx.sendSocketMessage({
        data: JSON.stringify(
          {
            wx_id: 'my_wx_id',
            protocol: "info",
            tcp_id: "wujing-air-B123",
            func: "params",
            period: item
          }
        ),
        success: function () {
          console.info(firstUpper(item) + 'ly Changes Updated!');
        }
      });
    });

  },


  openDetailsPage: function () {
    const that = this;
    const airData = that.data.airData;
    const index = that.data.current;
    wx.setStorageSync('airData', airData);
    if (wx.getStorageInfoSync('airData')) {
      wx.navigateTo({
        url: '../info/info?index=' + index
      });
    }
  },


  onSystemSwitchChanged: function () {
    const that = this;
    const current = that.data.current;
    var airState = that.data.airState;
    airState[current].systemOn = !airState[current].systemOn;
    that.setData({
      airState: airState
    });
    const socketConnected = app.globalData.socketConnected;
    if (socketConnected) {
      wx.sendSocketMessage({
        data: JSON.stringify(
          {
            wx_id: 'my_wx_id',
            protocol: "func",
            tcp_id: "wujing-air-B123",
            func: airState[current].systemOn ? "on" : "off",
            params: 2
          }
        ),
        success: function () {
          console.info("SystemOn: " + airState[current].systemOn);
        }
      });
    }
    if (airState[current].systemOn) {
      airState[current].automodeOn = false;
      that.setData({
        airState: airState
      });
    }
  },


  onAutomodeSwitchChanged: function () {
    const that = this;
    const current = that.data.current;
    var airState = that.data.airState;
    if (airState[current].systemOn) {
      airState[current].automodeOn = !airState[current].automodeOn;
      that.setData({
        airState: airState
      });
    }
  },


  onWindlevelChanged: function (res) {
    const that = this;
    const current = that.data.current;
    var airState = that.data.airState;
    const windlevel = res.detail.value;
    airState[current].windlevel = windlevel;
    that.setData({
      airState: airState
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
    var airState = that.data.airState;
    airState[current].oxygenlevel = res.detail.value;
    that.setData({
      airState: airState
    });
  }
})
