//lbs.amap.com key
const apiKey = "f2f456df296c41ddaf3e1742468f0dbf";

//get weather info
function getWeather(adcode, callback) {
  const apiURL = "https://restapi.amap.com/v3/weather/weatherInfo?output=json&extensions=base&city=" + adcode + "&key=" + apiKey;
  wx.request({
    url: apiURL,
    success: function (res) {
      var weather = res.data.lives[0].weather;
      callback(weather);
    }
  });
}

//get city name from lat & lon
function getCityName(latitude, longitude, callback) {
  var apiURL = "https://restapi.amap.com/v3/geocode/regeo?output=json&location=" + longitude + "," + latitude + "&key=" + apiKey;
  wx.request({
    url: apiURL,
    success: function (res) {
      var cityName = res.data.regeocode.addressComponent.city;
      if(cityName.length == 0){
        cityName = res.data.regeocode.addressComponent.province;
      }
      const adcode = res.data.regeocode.addressComponent.adcode;
      callback({
        city: cityName,
        adcode: adcode
      });
    }
  });
}

//print out
function printOut(callback){
  var lat = 39.990464;
  var lon = 116.481488;
  var city = "北京市";
  var adcode = "110101";
  var weather = "";
  var flag = [false, false];
  wx.getLocation({
    success: function (res) {
      lat = res.latitude;
      lon = res.longitude;
      getCityName(lat, lon, function (res) {
        city = res.city;
        adcode = res.adcode;
        flag[0] = true;
      });
      getWeather(adcode, function (res) {
        weather = res;
        flag[1] = true;
      });
      const timer = setInterval(function(){
        if(flag.indexOf(false) == -1){
          callback({
            lat: lat,
            lon: lon,
            city: city,
            weather: weather
          });
          clearInterval(timer);
        }
      }, 100);
    }
  }); 
}
//choose background image
function getBgImage(aqi, callback) {
  if (aqi<=50) {
      callback({
        bgImage: "one",
        topColor: "#209E85"
      });
    }
  else if (aqi>= 51 && aqi<= 100) {
      callback({
        bgImage: "two",
        topColor: "#FFDF78"
      });
    }
  else if (aqi >= 101 && aqi <= 150) {
    callback({
      bgImage: "three",
      topColor: "#F5AA78"
    });
  }
  else if (aqi >= 151 && aqi <= 200) {
    callback({
      bgImage: "four",
      topColor: "#FD5B78"
    });
  }
  else if (aqi >= 201 && aqi <= 300) {
    callback({
      bgImage: "five",
      topColor: "#B56595"
    });
  }
  else {
    callback({
      bgImage: "six",
      topColor: "#65538C"
    });
  }
  }
  
//choose weather icon
function getWeatherIcon(weatherData, callback) {
  var iconName = undefined;
  if (weatherData.weather.indexOf("雨") != -1) {
    iconName = "Rainy";
  }
  else if (weatherData.weather.indexOf("阵雨") != -1) {
    iconName = "Shower";
  }
  else if (weatherData.weather.indexOf("雷阵雨") != -1) {
    iconName = "ThunderShower";
  }
  else if (weatherData.weather.indexOf("雪") != -1) {
    iconName = "Snowy";
  } 
  else if (weatherData.weather.indexOf("多云") != -1) {
    iconName = "Cloudy";
  }
  else if (weatherData.weather.indexOf("阴") != -1) {
    iconName = "Overcast";
  }
  else if (weatherData.weather.indexOf("霾") != -1) {
    iconName = "Hazy";
  }
  else{
    iconName = "Sunny";
  }
  callback({
    weatherIcon: iconName
  });
}


module.exports = {
  getWeather: printOut,
  getBgImage: getBgImage,
  getWeatherIcon: getWeatherIcon
}