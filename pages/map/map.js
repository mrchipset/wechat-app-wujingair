var app = getApp();

Page({
  data: {
    windowSize: [],
    lat: '',
    lng: '',
    scale: 18,
    markers: [{
      iconPath: "../../src/button-icon/LocGreen.gif",
      id: 0,
      latitude: '',
      longitude: '',
      width: 64,
      height: 100
    }],
    controls: [
      /*
      {
        id: 1,
        iconPath: '../../src/button-icon/LocateMarker.png',
        position: {
          left: 0,
          top: 300 - 50,
          width: 50,
          height: 50
        },
        clickable: true
      }
      */
    ]
  },


  onLoad: function(options){
    const that = this;
    var lat = -1;
    var lng = -1;
    var markers = that.data.markers;

    wx.getLocation({
      success: function(res) {
        lat = res.latitude;
        lng = res.longitude;
        console.info("Latitude: " + lat);
        console.info("Longitude: " + lng);

        markers[0].latitude = lat;
        markers[0].longitude = lng;
        
        var markerCnt = Math.round(Math.random() * 7 + 3);
        var randgap = 0.005;
        for(var i=1; i<markerCnt; i++){
          markers.push({
            iconPath: "../../src/button-icon/LocGreen.gif",
            id: i,
            latitude: lat + Math.random() * randgap * 2 - randgap,
            longitude: lng + Math.random() * randgap * 2 - randgap,
            width: 64,
            height: 100
          });
        }
        markers[1].iconPath = "../../src/button-icon/LocRed.gif";

        that.setData({
          windowSize: app.globalData.windowSize,
          lat: lat,
          lng: lng,
          markers: markers
        });
      }
    });

  },


  regionchange(e) {
    //console.log(e.type)
  },
  markertap(e) {
    //console.log(e.markerId)
  },
  controltap(e) {
    //console.log(e.controlId)
  }
  
})