var app = getApp();

Page({
  data: {
    windowSize: [],
    test: '',
  },

  onLoad: function (options) {
    const that = this;
    that.setData({
      windowSize: app.globalData.windowSize
    });
  },


  onReady: function(){
    const that = this;
    wx.onCompassChange(function(res){
      var directions = res.direction.toFixed(2);
      that.setData({
        test: directions
      });
    });
    
  }
})