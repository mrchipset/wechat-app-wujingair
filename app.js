//app.js
App({
  globalData: {
    userInfo: null,
    windowSize: [],
    socketConnected: false
  },

  onLaunch: function () {
    const that = this;
    wx.login({
      success: function() {
        wx.getUserInfo({
          success: function (res) {
            that.globalData.userInfo = res.userInfo;
          }
        });
      }
    });
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.windowSize = [res.windowHeight, res.windowWidth];
      }
    });
  }
  
})