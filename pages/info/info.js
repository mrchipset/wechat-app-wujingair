// pages/info/info.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');

import * as echarts from '../../utils/echarts/echarts.js';
import chinaJson from '../../src/map-data/china.js';

Page({
  data: {
    userInfo: {},
    windowSize: [],
    weatherData: {},
    weatherIcon: 'Sunny',
    airData: {},
    current: 0,
    mapData: [],
    echart_top: {
      lazyLoad: true
    },
    echart_bottom: {
      lazyLoad: true
    }
  },


  onLoad: function () {
    const that = this;
    const airData = wx.getStorageSync('airData');
    wx.removeStorageSync('airData');
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo,
      airData: airData,
      mapData: app.globalData.mapData
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
    that.echartTop = that.selectComponent('#echart-top');
    that.echartBottom = that.selectComponent('#echart-bottom');
    that.onPageChanged();
  },


  lastPage: function () {
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

  onPageChanged: function () {
    const that = this;
    const current = that.data.current;
    const windowSize = that.data.windowSize;
    const airData = that.data.airData;
    switch (that.data.current) {
      case 0:
        that.plotConcents(that.echartTop, airData);
        that.plotDailyChange(that.echartBottom, airData);
        break;
      case 1:
        that.plotWeeklyChange(that.echartTop, airData);
        that.plotMonthlyChange(that.echartBottom, airData);
        break;
      case 2:
        that.plotProvinceContour(that.echartTop, airData.Province);
        that.plotChinaContour(that.echartBottom);
        break;
    }

  },


  plotConcents: function (canvasId, airData) {
    const that = this;
    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });

      const option = {
        color: ['#7cb5ec'],
        title: {
          text: '污染物浓度（微克/立方米）'
        },
        grid: {
          left: 20,
          right: 20,
          bottom: 15,
          top: 40,
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: 'gray'
              }
            },
            axisLabel: {
              color: 'gray'
            }
          }
        ],
        yAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: ['甲醛', 'PM1.0', 'PM2.5', 'PM10'],
            axisLine: {
              lineStyle: {
                color: 'gray'
              }
            },
            axisLabel: {
              color: 'gray'
            }
          }
        ],
        series: [
          {
            name: '污染物浓度（微克/立方米）',
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'inside'
              }
            },
            data: airData.Concent
          }
        ]
      };
      chart.setOption(option);
      return chart;
    });
  },


  plotDailyChange: function (canvasId, airData) {
    const that = this;
    const date = new Date();
    var now = date.getHours() - 1;
    var categories = [];
    while (now >= 0) {
      categories.unshift('当日' + now + ':00');
      now--;
    }
    now = 23;
    while (now > date.getHours() - 1) {
      categories.unshift('昨日' + now + ':00');
      now--;
    }

    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        color: ['#7cb5ec'],
        tooltip: {
          trigger: 'axis'
        },
        title: {
          text: '过去24小时AQI指数变化'
        },
        grid: {
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories
        },
        yAxis: {
          x: 'center',
          type: 'value'
        },
        series: [{
          name: '过去24小时AQI指数变化',
          type: 'line',
          smooth: true,
          data: airData.History.daily
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },


  plotWeeklyChange: function (canvasId, airData) {
    const that = this;
    const date = new Date();
    var now = date.getDay() - 1;
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
    while (now > date.getDay() - 1) {
      categories.unshift(weekday[now]);
      now--;
    }

    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        color: ['#7cb5ec'],
        tooltip: {
          trigger: 'axis'
        },
        title: {
          text: '过去7天AQI指数变化'
        },
        grid: {
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories
        },
        yAxis: {
          x: 'center',
          type: 'value'
        },
        series: [{
          name: '过去7天AQI指数变化',
          type: 'line',
          smooth: true,
          data: airData.History.weekly
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },



  plotMonthlyChange: function (canvasId, airData) {
    const that = this;
    const date = new Date();
    var now = date.getMonth() - 1;
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
    while (now > date.getMonth() - 1) {
      categories.unshift(months[now]);
      now--;
    }

    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var option = {
        color: ['#7cb5ec'],
        tooltip: {
          trigger: 'axis'
        },
        title: {
          text: '过去12月AQI指数变化'
        },
        grid: {
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories
        },
        yAxis: {
          x: 'center',
          type: 'value'
        },
        series: [{
          name: '过去12月AQI指数变化',
          type: 'line',
          smooth: true,
          data: airData.History.monthly
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },


  plotChinaContour: function (canvasId) {
    const that = this;
    const mapData = that.data.mapData;
    //const chinaJson = require(mapData[0]);
    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      echarts.registerMap('china', chinaJson);

      var data = [];
      for (var i = 0; i < chinaJson.features.length; i++) {
        data.push({
          name: chinaJson.features[i].properties.name,
          value: (Math.random() * 350).toFixed(0)
        });
      }
      const option = {
        title: {
          text: '全国AQI分布云图'
        },
        visualMap: {
          min: 0,
          max: 350,
          left: 'right',
          top: 'center',
          text: ['350', '0'],
          calculable: false,
          color: ['#7cb5ec', '#ffffff']
        },
        series: [{
          type: 'map',
          mapType: 'china',
          label: {
            normal: {
              show: false
            },
            emphasis: {
              textStyle: {
                color: '#000'
              }
            }
          },
          itemStyle: {
            normal: {
              borderColor: 'gray',
              areaColor: '#fff',
            },
            emphasis: {
              areaColor: '#f7a35c',
              borderWidth: 0
            }
          },
          animation: true,
          data: data
        }]
      };
      chart.setOption(option);
      return chart;
    });
  },


  plotProvinceContour: function (canvasId, province) {
    const that = this;
    var provinceJson = null;
    wx.request({
      url: 'https://wujingair.com/map_data/' + province + '.json',
      method: 'GET',
      dataType: 'json',
      success: function(res){
        provinceJson = res.data;
        console.log(provinceJson);
        canvasId.init((canvas, width, height) => {
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height
          });
          echarts.registerMap(province, provinceJson);

          var data = [];
          for (var i = 0; i < provinceJson.features.length; i++) {
            data.push({
              name: provinceJson.features[i].properties.name,
              value: (Math.random() * 350).toFixed(0)
            });
          }

          const option = {
            title: {
              text: province + '地区AQI分布云图'
            },
            visualMap: {
              min: 0,
              max: 350,
              left: 'right',
              top: 'center',
              text: ['350', '0'],
              calculable: false,
              color: ['#7cb5ec', '#ffffff']
            },
            series: [{
              type: 'map',
              mapType: province,
              label: {
                normal: {
                  show: false
                },
                emphasis: {
                  textStyle: {
                    color: '#000'
                  }
                }
              },
              itemStyle: {
                normal: {
                  borderColor: 'gray',
                  areaColor: '#fff',
                },
                emphasis: {
                  areaColor: '#f7a35c',
                  borderWidth: 0
                }
              },
              animation: true,
              data: data
            }]
          };
          chart.setOption(option);
          return chart;
        });
      }
    });


    
  }

});