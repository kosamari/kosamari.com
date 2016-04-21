function ConvolutionMatrix (elID, width, d, eye, valueFlag) {
  var eye = eye || false
  var data = d
  var w = width
  var h = width
  var valueFlag = valueFlag || false
  var pixSize = w/data.width
  var canvas = $(elID)[0]
  var ctx = canvas.getContext('2d')


  function addRect(ctx,x,y,w,h){
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(x,y,w,h);
    return
  }

  function addEye(ctx, x, y){
    // eyes
    ctx.beginPath();
    ctx.ellipse(x+pixSize/5, y+pixSize/4, pixSize/11, pixSize/6, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.lineWidth = 1;
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
    ctx.fillText('  '+val,x+pixSize/2.5,y+pixSize/1.1);
  }

  function addBoundingBox(ctx){
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(2,2,w-4,h-4);
  }

  function render(){
    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var x, y, i
    for(y = 0; y < data.height; y++){
      for(x = 0; x < data.width; x++){
        i = (x + y * data.width)
        addRect(ctx, x * pixSize, y * pixSize, pixSize, pixSize)
        if(eye && data.data[i] !== null ){
          addEye(ctx, x * pixSize, y * pixSize)
        }
        if(valueFlag){
          addValue(ctx, x * pixSize, y * pixSize, data.data[i])
        }
      }
    }
    addBoundingBox(ctx)
  }
  render()

  function redraw(newWidth, d){
    w = newWidth
    h = newWidth
    data = d || data
    pixSize = w/data.width
    render()
  }
  return {
    redraw:redraw
  }
}