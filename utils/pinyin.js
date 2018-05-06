function provc2py(provc) {
  switch (provc){
    case "安徽": return "anhui";
    case "澳门": return "aomen";
    case "北京": return "beijing";
    case "重庆": return "chongqing";
    case "福建": return "fujian";
    case "甘肃": return "gansu";
    case "广东": return "guangdong";
    case "广西": return "guangxi";
    case "贵州": return "guizhou";
    case "海南": return "hainan";
    case "河北": return "hebei";
    case "黑龙江": return "heilongjiang";
    case "河南": return "henan";
    case "湖北": return "hubei";
    case "湖南": return "hunan";
    case "江苏": return "jiangsu";
    case "江西": return "jiangxi";
    case "吉林": return "jilin";
    case "辽宁": return "liaoning";
    case "内蒙古": return "neimenggu";
    case "宁夏": return "ningxia";
    case "青海": return "qinghai";
    case "山东": return "shandong";
    case "上海": return "shanghai";
    case "山西": return "shanxi";
    case "陕西": return "shanxi1";
    case "四川": return "sichuan";
    case "台湾": return "taiwan";
    case "天津": return "tianjing";
    case "香港": return "xianggang";
    case "新疆": return "xinjiang";
    case "西藏": return "xizang";
    case "云南": return "yunnan";
    case "浙江": return "zhejiang";
    default: return "china";
  }
}

function str2py(str, callback){
  const apiUrl = "https://www.wujingair.com/getpinyin.php?s=" + str;
  wx.request({
    url: apiUrl,
    success: function(res){
      const py = res.data.result;
      var pystr = "";
      for(var i=0; i<py.length; i++){
        pystr = pystr + py[i];
      }
      callback({
        py: pystr
      });
    },
    fail: function(){
      callback({
        py: str
      });
    }
  });
}

module.exports = {
  str2py: str2py,
  provc2py: provc2py
}