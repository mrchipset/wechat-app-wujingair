// pages/index/index.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    windowSize: []
  },
  
  
  onLoad: function () {
    const that = this;
    that.setData({
      windowSize: app.globalData.windowSize
    });
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo
      });
    } else if (that.data.canIUse){
      app.userInfoReadyCallback = function(res) {
        that.setData({
          userInfo: res.userInfo
        });
      }
    } else {
      wx.getUserInfo({
        success: function (res) {
          app.globalData.userInfo = res.userInfo;
          that.setData({
            userInfo: res.userInfo
          });
        }
      });
    }
  },

  
  onReady: function(){
    wx.setNavigationBarTitle({
      title: ''
    });
  },


  start2use: function(){
    wx.redirectTo({
      url: '../menu/menu'
    });
  },


  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo
    });
  }
})
