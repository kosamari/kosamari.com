function CanvasImage(canvasID, imageId, width, type){
  var canvas = $(canvasID)[0]
  var img = $(imageId)[0]
  img.crossOrigin = "Anonymous";
  var ctx = canvas.getContext('2d')
  var ratio
  var imgData
  var gc = document.createElement('canvas')
  var gctx = gc.getContext('2d')

  var type = type || null

  function draw(){
    ratio = img.height / img.width
    canvas.width = width
    canvas.height= width * ratio

    ctx.drawImage(img,0,0,img.width, img.height,0,0,canvas.width,canvas.height)
    imgData = ctx.getImageData(0,0, canvas.width, canvas.height)

    if(type){
      var worker = new Worker('assets/js/ConvolutionWorker.js')
      var data = {data:imgData, type:type}
      worker.postMessage(data, [data.data.data.buffer])
      worker.onmessage = function(message){
        ctx.putImageData(new ImageData(message.data.data, message.data.width, message.data.height), 0, 0)
        worker.terminate()
      }
    }
  }

  function original(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imgData, 0, 0)
  }

  function invert(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.invert(imgData), 0, 0)
  }
  function brightness(level){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.brightness(imgData, {level: level}), 0, 0)
  }
  function contrast(level){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.contrast(imgData, {level: level}), 0, 0)
  }
  function posterize(level){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.posterize(imgData, {level: level}), 0, 0)
  }
  function solarize(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.solarize(imgData), 0, 0)
  }
  function threshold(level){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.threshold(imgData, {level: level}), 0, 0)
  }
  function pseudocolor(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(grafi.pseudocolor(imgData), 0, 0)
  }

  draw()
  return {
    original: original,
    invert: invert,
    brightness: brightness,
    contrast: contrast,
    posterize: posterize,
    solarize: solarize,
    threshold: threshold,
    pseudocolor:pseudocolor,
  }
}
