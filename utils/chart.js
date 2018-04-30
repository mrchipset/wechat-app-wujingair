/* creat a bar chart in vertical orientation */
function verticalBar(canvasId, data){
  const ctx = wx.createCanvasContext(canvasId); 
  var getRem = function (str) {
    var rem = 0, charCode = -1;
    for (var i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128)
        rem += 1;
      else
        rem += 2;
    }
    return rem;
  };
  var maxRem = 0;
  for (var i = 0; i < data.length; i++) {
    var thisRem = getRem(data[i].tag);
    if (thisRem > maxRem) {
      maxRem = thisRem;
    }
  }
  const maxPx = maxRem * 16;
  var height = 0;
  var width = 0;
  var length = [];
  var maxData = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].value > maxData) {
      maxData = data[i].value;
    }
  }
  var flag = false;
  wx.createSelectorQuery().select('#' + canvasId).boundingClientRect(function (rect) {
    height = rect.height / (data.length * 2 - 1);
    width = rect.width - maxPx * 2;
    for (var i = 0; i < data.length; i++){
      length.push(data[i].value / maxData * width);
    }
    flag = true;
  }).exec();
  const timer = setInterval(function(){
    if (flag) {
      ctx.draw();
      for (var i = 0; i < data.length; i++) {
        ctx.setFillStyle("#ffffff");
        ctx.setTextAlign('center');
        ctx.setFontSize(height);
        ctx.fillText(data[i].tag, maxPx/2, (i * 2 + 0.85) * height)
        ctx.fillRect(maxPx + 5, i * 2 * height, length[i], height);
        ctx.setTextAlign('left');
        ctx.fillText(data[i].value, length[i] + maxPx + 10, (i * 2 + 0.85) * height);
        ctx.draw(true);
      }
      clearInterval(timer);
    }
  }, 50);
}


/* creat a bar chart in horizontal orientation on the bottom of the canvas */
function bottomBar(canvasId, data, title) {
  const ctx = wx.createCanvasContext(canvasId);
  var canvasHeight = 0;
  var canvasWidth = 0;
  var height = 0;
  var width = 0;
  var length = [];
  var maxData = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i] > maxData) {
      maxData = data[i];
    }
  }
  var flag = false;
  wx.createSelectorQuery().select('#' + canvasId).boundingClientRect(function (rect) {
    if (rect != null) {
      canvasHeight = rect.height / 2;
      canvasWidth = rect.width;
      height = (canvasHeight - 16) * 0.8;
      width = canvasWidth / data.length;
      for (var i = 0; i < data.length; i++) {
        length.push(data[i] / maxData * height);
      }
      flag = true;
    }
  }).exec();
  var timer = setInterval(function () {
    if (flag) {
      ctx.clearRect(0, canvasHeight, canvasWidth, 2 * canvasHeight);
      ctx.setFillStyle('#000000');
      ctx.setTextAlign('center');
      ctx.setFontSize(16);
      ctx.fillText(title, canvasWidth / 2, canvasHeight + 16);
      ctx.draw(true);
      for (var i = 0; i < data.length; i++) {
        ctx.fillRect(i * width, canvasHeight * 2 - length[i], width, length[i]);
        ctx.fillText(data[i], (i + 0.5) * width, canvasHeight * 2 - length[i] - 5);
        ctx.draw(true);
      }
      clearInterval(timer);
    }
  }, 50);
}


/* creat a line chart on the top of canvas */
function topLine(canvasId, data, title) {
  const ctx = wx.createCanvasContext(canvasId);
  var canvasHeight = 0;
  var canvasWidth = 0;
  var height = 0;
  var width = 0;
  var length = [];
  var maxData = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i] > maxData) {
      maxData = data[i];
    }
  }
  var flag = false;
  wx.createSelectorQuery().select('#' + canvasId).boundingClientRect(function (rect) {
    if (rect != null) {
      canvasHeight = rect.height / 2;
      canvasWidth = rect.width;
      height = (canvasHeight - 16) * 0.8;
      width = canvasWidth / (data.length - 1);
      for (var i = 0; i < data.length; i++) {
        length.push(data[i] / maxData * height);
      }
      flag = true;
    }
  }).exec();
  var timer = setInterval(function () {
    if (flag) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.setFillStyle('#000000'); 
      ctx.setLineCap('butt');
      ctx.setLineWidth(3);
      ctx.setLineJoin('round');
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight - length[0]);
      for (var i = 1; i < data.length; i++) {
        ctx.lineTo(i * width, canvasHeight - length[i]);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.moveTo(0, canvasHeight);
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.stroke();
      ctx.setTextAlign('center');
      ctx.setFontSize(16);
      ctx.fillText(title, canvasWidth / 2, 16);
      ctx.draw(true);
      clearInterval(timer);
    }
  }, 50);
}


/* creat a pie chart */
function pie(canvasId, data, title) {
  const ctx = wx.createCanvasContext(canvasId);
  var canvasHeight = 0;
  var canvasWidth = 0;
  const colors = ['']
  var radius = [];
  var radian = [];
  var maxData = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i] > maxData) {
      maxData = data[i];
    }
  }
  var flag = false;
  wx.createSelectorQuery().select('#' + canvasId).boundingClientRect(function (rect) {
    if (rect != null) {
      canvasHeight = rect.height;
      canvasWidth = rect.width;
      height = (canvasHeight - 16) * 0.8;
      width = canvasWidth / (data.length - 1);
      for (var i = 0; i < data.length; i++) {
        length.push(data[i] / maxData * height);
      }
      flag = true;
    }
  }).exec();
  var timer = setInterval(function () {
    if (flag) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.setFillStyle('#000000');
      ctx.setLineCap('butt');
      ctx.setLineWidth(3);
      ctx.setLineJoin('round');
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight - length[0]);
      for (var i = 1; i < data.length; i++) {
        ctx.lineTo(i * width, canvasHeight - length[i]);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.moveTo(0, canvasHeight);
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.stroke();
      ctx.setTextAlign('center');
      ctx.setFontSize(16);
      ctx.fillText(title, canvasWidth / 2, 16);
      ctx.draw(true);
      clearInterval(timer);
    }
  }, 50);
}


module.exports = {
  verticalBar: verticalBar,
  bottomBar: bottomBar,
  topLine: topLine
}