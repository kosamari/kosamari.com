function ImageDataDemo (elID, width, d, eye) {
  var eye = eye || false
  var data = d
  var colorData = data.data
  var w = width
  var pixSize = w/data.width

  var h = pixSize * data.height

  var value
  var valueFlag = false
  var canvas = $(elID)[0]
  var ctx = canvas.getContext('2d')

  function addRect(ctx,x,y,w,h,r,g,b,a){
    ctx.fillStyle = 'rgba('+r+','+g+','+b+','+ a/255 +')'
    ctx.fillRect(x,y,w,h)
    return
  }

  function addEye(ctx, x, y){
    ctx.beginPath();
    // eyes
    ctx.beginPath();
    ctx.ellipse(x+pixSize/5, y+pixSize/4, pixSize/11, pixSize/6, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath(); 
    ctx.beginPath();
    ctx.ellipse(x+pixSize/2.5, y+pixSize/4, pixSize/11, pixSize/6, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.stroke()
    ctx.closePath()

    // eye balls
    ctx.beginPath();
    ctx.arc(x+pixSize/5, y+pixSize/3.1, pixSize/15 , 0, 2*Math.PI);
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.arc(x+pixSize/2.5,y+pixSize/3.1, pixSize/15 , 0, 2*Math.PI);
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.closePath(); 
    return
  }

  function addValue(ctx, x, y, val){
    ctx.font = pixSize/3 + "px Arial";
    ctx.fillText('× '+val,x+pixSize/2.5,y+pixSize/1.1);
  }


  function render(){
    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var x, y, i
    for(y = 0; y < data.height; y++){
      for(x = 0; x < data.width; x++){
        i = (x + y * data.width) * 4
        addRect(ctx, x * pixSize, y * pixSize, pixSize, pixSize, colorData[i], colorData[i+1], colorData[i+2], colorData[i+3] )
        if(eye && (colorData[i] + colorData[i+1] + colorData[i+2] + colorData[i+3]) !== 0 ){
          addEye(ctx, x * pixSize, y * pixSize)
        }
        if(valueFlag){
          addValue(ctx, x * pixSize, y * pixSize, value[x + y * data.width])
        }
      }
    }
  }
  render()

  function redraw(newWidth, d, val, valf){
    value = val || value
    valueFlag = valf === undefined ? valueFlag : valf
    data = d || data
    w = newWidth
    h = (newWidth / data.width) * data.height
    pixSize = w/data.width
    colorData = data.data
    render()
  }
  return {
    redraw:redraw
  }
}