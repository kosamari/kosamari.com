function ConvolutionDemo (elID, width, d, value, line) {

  var data = d
  var w = width
  var pixSize = w/data.width
  var h = pixSize * data.height
  var line = false
  var colorFlag = -1
  var valueFlag = value || false
  var canvas = $(elID)[0]
  var ctx = canvas.getContext('2d')
  var annimation

  function addRect(ctx,x,y,w,h,color){
    ctx.lineWidth = 0;
    ctx.fillStyle = 'rgba('+color[0]+','+color[1]+','+color[2]+','+ color[3]/255 +')'
    ctx.fillRect(x,y,w,h)
    return
  }

  function addValue(ctx, x, y, val){
    ctx.font = pixSize/7 + "px Arial";
    ctx.fillStyle = 'gray'
    ctx.fillText(val,x+pixSize/10,y+pixSize/1.1);
  }

  function addRectLine(ctx,x,y,w,h){
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 4;
    ctx.strokeRect(x,y,pixSize,pixSize);
    return
  }

  function addBoundingBox(ctx, x, y){
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 4;
    ctx.strokeRect(x,y,pixSize*3-2,pixSize*3-2);
  }

  function makeColor(index, flag){
    var d = data.data
    if (flag) {
      d = data.blurdata
    }
    switch(colorFlag) {
      case 0:
          return [d[index],0,0,d[index+3]]
          break;
      case 1:
          return [0,d[index+1],0,d[index+3]]
          break;
      case 2:
          return [0,0,d[index+2],d[index+3]]
          break;
      case -1:
          return [d[index],d[index+1],d[index+2],d[index+3]]
    }
  }

  function makeValue(index){
    switch(colorFlag) {
      case 0:
          return data.data[index]
          break;
      case 1:
          return data.data[index+1]
          break;
      case 2:
          return data.data[index+2]
          break;
      case -1:
          return data.data[index]+', '+data.data[index+1]+', '+data.data[index+2]
    }
  }

  function _baseDraw(){
    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var x, y, i
    for(y = 0; y < data.height; y++){
      for(x = 0; x < data.width; x++){
        i = (x + y * data.width) * 4
        addRect(ctx, x * pixSize, y * pixSize, pixSize, pixSize,  makeColor(i))
        if(valueFlag){
          addValue(ctx, x * pixSize, y * pixSize, makeValue(i))
        }
        // if(line && x < 3 && y < 3){
        //   addRectLine(ctx, x * pixSize, y * pixSize, pixSize, pixSize)
        // }
      }
    }
  }

  function renderFinal(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var x, y, i
    for(y = 0; y < data.height; y++){
      for(x = 0; x < data.width; x++){
        i = (x + y * data.width) * 4
        addRect(ctx, x * pixSize, y * pixSize, pixSize, pixSize,  makeColor(i, true))
      }
    }
  }
  function annimateBox(){
    _baseDraw()
    var count = 0
    var x = 0
    var y = 0
    var cells = data.width * data.height
    function moveBox(){
      if(count >= cells){
        renderFinal()
        return;
      }

      _baseDraw()
      addRect(ctx,(x * pixSize),(y * pixSize),pixSize,pixSize,[255,255,255,200])
      addBoundingBox(ctx, (x * pixSize) - pixSize + 2, (y * pixSize) - pixSize  + 2)
      addRectLine(ctx, (x * pixSize) - pixSize, (y * pixSize) - pixSize, pixSize, pixSize)
      addRectLine(ctx, (x * pixSize), (y * pixSize) - pixSize, pixSize, pixSize)
      addRectLine(ctx, (x * pixSize) + pixSize, (y * pixSize) - pixSize, pixSize, pixSize)
      addRectLine(ctx, (x * pixSize) - pixSize, (y * pixSize), pixSize, pixSize)
      addRectLine(ctx, (x * pixSize), (y * pixSize), pixSize, pixSize)
      addRectLine(ctx, (x * pixSize) + pixSize, (y * pixSize) , pixSize, pixSize)
      addRectLine(ctx, (x * pixSize) - pixSize, (y * pixSize) + pixSize , pixSize, pixSize)
      addRectLine(ctx, (x * pixSize), (y * pixSize), pixSize + pixSize, pixSize)
      addRectLine(ctx, (x * pixSize) + pixSize, (y * pixSize) + pixSize, pixSize, pixSize)

      if(x < data.width-1){
        x++
      }else{
        x = 0
        y++
      }
      count++
      annimation = setTimeout(moveBox,150)
    }
    annimation = setTimeout(moveBox, 200)
  }

  function render(){
    _baseDraw()
    // if(line){addBoundingBox(ctx, 2, 2)}
  }
  render()

  function redraw(newWidth, channel, value, l){
    clearTimeout(annimation)
    line = l
    colorFlag = channel === undefined ? -1 : channel
    data = d || data
    valueFlag = value
    w = newWidth
    h = (newWidth / data.width) * data.height
    pixSize = w/data.width
    return render()
  }
  return {
    redraw:redraw,
    annimate:annimateBox
  }
}