// pages/info/info.js
const app = getApp();
const weatherUtil = require('../../utils/weather.js');
const pinyinUtil = require('../../utils/pinyin.js');

import * as echarts from '../../utils/echarts/echarts.js';
import chinaJson from '../../src/map-data/china.js';

Page({
  data: {
    userInfo: {},
    windowSize: [],
    weatherData: {},
    weatherIcon: 'Sunny',
    index: -1,
    airData: {},
    mapData: [],
    labels: [
      '实时污染物浓度(微克/立方米)',
      '过去24小时污染物浓度变化',
      '过去7天污染物浓度变化',
      '过去12月污染物浓度变化',
      '当地AQI指数分布',
      '全国AQI指数分布',
    ],
    charts: [
      {
        lazyLoad: true
      },
      {
        lazyLoad: true
      },
      {
        lazyLoad: true
      },
      {
        lazyLoad: true
      },
      {
        lazyLoad: true
      },
      {
        lazyLoad: true
      }
    ]
  },


  onLoad: function (options) {
    const that = this;
    const airData = wx.getStorageSync('airData');
    that.setData({
      windowSize: app.globalData.windowSize,
      userInfo: app.globalData.userInfo,
      index: options.index,
      airData: airData[options.index],
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
    that.showPlots();
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


  showPlots: function(){
    const that = this;
    var airData = that.data.airData;

    that.chart0 = that.selectComponent('#chart0');
    that.plotConcents(that.chart0, airData, true);
    setInterval(function () {
      airData = wx.getStorageSync('airData');
      airData = airData[that.data.index];
      that.plotConcents(that.chart0, airData, false);
    }, 3000);

    that.chart1 = that.selectComponent('#chart1');
    that.plotDailyChange(that.chart1, airData);

    that.chart2 = that.selectComponent('#chart2');
    that.plotWeeklyChange(that.chart2, airData);

    that.chart3 = that.selectComponent('#chart3');
    that.plotMonthlyChange(that.chart3, airData);

    that.chart4 = that.selectComponent('#chart4');
    that.plotProvinceContour(that.chart4, airData.Province);
    const labels = that.data.labels;
    labels[4] = airData.Province + 'AQI指数分布';
    that.setData({
      labels: labels
    });

    that.chart5 = that.selectComponent('#chart5');
    that.plotChinaContour(that.chart5);
  },


  plotConcents: function (canvasId, airData, animation) {
    const that = this;
    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });

      var option = {
        animation: animation,
        color: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d'],
        /*
        title: {
          text: '污染物浓度（微克/立方米）'
        },
        */
        grid: {
          left: 0,
          right: 0,
          bottom: 30,
          top: 30,
          containLabel: true
        },
        yAxis: {
          type: 'value'
        },
        xAxis: {
          type: 'category',
          data: ['甲醛', 'PM1.0', 'PM2.5', 'PM10']
        },
        series: {
          name: '污染物浓度（微克/立方米）',
          type: 'bar',
          label: {
            normal: {
              show: true,
              position: 'top'
            }
          },
          data: airData.Concent
        }
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
        /*
        title: {
          text: '过去24小时污染物浓度变化'
        },
        */
        color: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d'],
        legend: {
          bottom: 30
        },
        tooltip: {
          axisPointer: {
            type: 'cross',
            snap: true
          }
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 60,
          top: 30,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: categories
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '甲醛',
            type: 'line',
            smooth: true,
            data: airData.History.daily.voc
          },
          {
            name: 'PM1.0',
            type: 'line',
            smooth: true,
            data: airData.History.daily.pm1
          },
          {
            name: 'PM2.5',
            type: 'line',
            smooth: true,
            data: airData.History.daily.pm2
          },
          {
            name: 'PM10',
            type: 'line',
            smooth: true,
            data: airData.History.daily.pm10
          }
        ]
      };
      chart.setOption(option);
      return chart;
    });
  },



  plotDailyChange2: function (canvasId, airData) {
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
    categories = ['0:00', '1:00', '2:00'];

    canvasId.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      var baseOption = {
        /*
        title: {
          text: '过去24小时污染物浓度变化'
        },
        */
        color: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d'],
        grid: {
          left: 0,
          right: 0,
          bottom: 60,
          top: 30,
          containLabel: true,
        },
        timeline: {
          axisType: 'category',
          autoPlay: false,
          data: categories
        },
        xAxis: {
          type: 'category',
          data: ['甲醛', 'PM1.0', 'PM2.5', 'PM10']
        },
        yAxis: {
          type: 'value',
          max: 120
        },
        series: {
          name: '浓度（微克/立方米）',
          type: 'bar'
        }
      };
      var option = [
        {
          series: {
            data: [
              airData.History.daily.voc[0],
              airData.History.daily.pm1[0],
              airData.History.daily.pm2[0],
              airData.History.daily.pm10[0]
            ]
          }
        },
        {
          title: {
            text: categories[1]
          },
          series: {
            data: [
              airData.History.daily.voc[1],
              airData.History.daily.pm1[1],
              airData.History.daily.pm2[1],
              airData.History.daily.pm10[1]
            ]
          }
        },
        {
          title: {
            text: categories[2]
          },
          series: {
            data: [
              airData.History.daily.voc[2],
              airData.History.daily.pm1[2],
              airData.History.daily.pm2[2],
              airData.History.daily.pm10[2]
            ]
          }
        }
      ];

      chart.setOption({
        baseOption: baseOption,
        options: option
      });
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
        /*
        title: {
          text: '过去7天AQI指数变化'
        },
        */
        color: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d'],
        legend: {
          bottom: 30
        },
        tooltip: {
          axisPointer: {
            type: 'cross',
            snap: true
          }
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 60,
          top: 30,
          containLabel: true,
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
        series: [
          {
            name: '甲醛',
            type: 'line',
            smooth: true,
            data: airData.History.weekly.voc
          },
          {
            name: 'PM1.0',
            type: 'line',
            smooth: true,
            data: airData.History.weekly.pm1
          },
          {
            name: 'PM2.5',
            type: 'line',
            smooth: true,
            data: airData.History.weekly.pm2
          },
          {
            name: 'PM10',
            type: 'line',
            smooth: true,
            data: airData.History.weekly.pm10
          }
        ]
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
        /*
        title: {
          text: '过去12月AQI指数变化'
        },
        */
        color: ['#7cb5ec', '#f7a35c', '#434348', '#90ed7d'],
        legend: {
          bottom: 30
        },
        tooltip: {
          axisPointer: {
            type: 'cross',
            snap: true
          }
        },
        grid: {
          left: 0,
          right: 0,
          bottom: 60,
          top: 30,
          containLabel: true,
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
        series: [
          {
            name: '甲醛',
            type: 'line',
            smooth: true,
            data: airData.History.monthly.voc
          },
          {
            name: 'PM1.0',
            type: 'line',
            smooth: true,
            data: airData.History.monthly.pm1
          },
          {
            name: 'PM2.5',
            type: 'line',
            smooth: true,
            data: airData.History.monthly.pm2
          },
          {
            name: 'PM10',
            type: 'line',
            smooth: true,
            data: airData.History.monthly.pm10
          }
        ]
      };
      chart.setOption(option);
      return chart;
    });
  },


  plotChinaContour: function (canvasId) {
    const that = this;
    const mapData = that.data.mapData;
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
        /*
        title: {
          text: '全国AQI分布云图'
        },
        */
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
    var provinceJson = wx.getStorageSync('map-data-' + province);
    function plot(){
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
          /*
          title: {
            text: province + '地区AQI分布云图'
          },
          */
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
    };

    if (!provinceJson){
      wx.request({
        url: 'https://gypsophilla.sorahjy.com/map_data/' + pinyinUtil.provc2py(province) + '.json',
        method: 'GET',
        dataType: 'json',
        success: function (res) {
          provinceJson = res.data;
          wx.setStorage({
            key: 'map-data-' + province,
            data: provinceJson,
          });
          plot();
        }
      });
    }else{
      plot();
    }  
  }

});