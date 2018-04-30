function decode (str){
  var bytes = [];
  for (var i = 0; i < str.length; ++i) {
    var charCode = str.charCodeAt(i);
    bytes.push(charCode & 0xFF);
  }
  var res = {
    "PM1_0": bytes[8] * 256 + bytes[9],
    "PM2_5": bytes[10] * 256 + bytes[11],
    "PM10": bytes[12] * 256 + bytes[13],
    "HCHO": (bytes[26] * 256 + bytes[27]) / 1000.0,
    "Tem": (bytes[28] * 256 + bytes[29]) / 10.0,
    "Hum": (bytes[30] * 256 + bytes[31]) / 10
  }
  return res;
}

function updateAirData(airData, newDataStr, current){
  var newData = decode(newDataStr);
  console.log(newData);
  airData[current].Tem = newData.Tem;
  airData[current].Hum = newData.Hum + "%";
  airData[current].Concent = [];
  airData[current].Concent.push({
    tag: "甲醛",
    value: newData.HCHO
  });
  airData[current].Concent.push({
    tag: "PM1.0",
    value: newData.PM1_0
  });
  airData[current].Concent.push({
    tag: "PM2.5",
    value: newData.PM2_5
  });
  airData[current].Concent.push({
    tag: "PM10",
    value: newData.PM10
  });
  airData[current].Concent.push({
    tag: 'TVOC',
    value: 34
  });
  airData[current].Concent.push({
    tag: 'VOC',
    value: 29
  });
  return airData;
}

module.exports = {
  decode: decode,
  updateAirData: updateAirData
}