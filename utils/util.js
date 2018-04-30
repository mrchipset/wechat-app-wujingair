const url = '';

/* Login & register on wujingair.com */
function login(code, userData) { 
  // code will be used to find openid
  // userData: {nickName, gender, city, province, country, avatarUrl}
  wx.request({
    url: url,
    method: 'POST',
    header: {
      "Content-Type": 'application/x-www-form-urlencoded'
    },
    data: {
      "api": "login",
      "code": code,
      "userData": userData
    },
    success: function(res) {
      // res: {success, openid, session_key}
      return res;
    }
  });
}

/* Read devices list */
function readDevices(openid) {
  wx.request({
    url: url,
    method: 'POST',
    header: {
      "Content-Type": 'application/x-www-form-urlencoded'
    },
    data: {
      "api": "read_devices",
      "openid": openid
    },
    success: function (res) {
      // res: {success, devices}
      // devices: [{Did, Dtype, State, AutoRun:{on, off}, Users, AQI, Concent:[{tag, value}], Loc}]
      return res;
    }
  });
}

/* Write devices list */
function writeDevices(openid, devices) {
  // devices: [{Did, Dtype, State, AutoRun:{on, off}, Users, AQI, Concent:[{tag, value}], Loc}]
  wx.request({
    url: url,
    method: 'POST',
    header: {
      "Content-Type": 'application/x-www-form-urlencoded'
    },
    data: {
      "api": "write_devices",
      "openid": openid,
      "devices": devices
    },
    success: function (res) {
      // res: {success, devices}
      // devices keeps the same as uploaded
      return res;
    }
  });
}


module.exports = {
  login: login,
  readDevices: readDevices,
  writeDevices: writeDevices
}