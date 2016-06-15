importScripts('../lib/grafi.js')

var dict = {
  blur: function(imgData){
    return grafi.blur(imgData, {type:'average'})
  },
  gblur: function(imgData){
    return grafi.blur(imgData)
  },
  sharp: function(imgData){
    return grafi.sharpen(imgData, {level: 1})
  }
}

function imageprocess(message){
  var d = dict[message.data.type](message.data.data)
  d.type = message.data.type
  postMessage(d);
}

onmessage = imageprocess