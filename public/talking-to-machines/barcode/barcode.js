function lettersToBinary(arr){
  var map = {
    '▌':'10',
    '█':'11',
    '▐':'01',
    ' ':'00'
  };

  arr = arr.map(function(el){return map[el];})
  return arr.join('')
}

function exec(data, evalflag){

  data = data.map(function(el){
    var dec = parseInt(el, 2);
    if(dec<31 || dec>126){
      return 32
    }
    return dec
  })

  var result = String.fromCharCode.apply(null,data)
  if(evalflag){
    try {
      return eval(result)
    }
    catch (e) {
      console.log('evaluation of following string failed\n==========\n' +result+'\n==========')
      throw e;
    }
  }
  return result
}

function createBarcode(string){
  var map = {
    '10':'▌',
    '11':'█',
    '01':'▐',
    '00':' '
  };
  var bin = ''
  var ch = ''
  for(var i=0;i<string.length;i++){
    var _bin = string[i].charCodeAt().toString(2)
    bin += "00000000".slice(String(_bin).length) + _bin
  }

  for (var j=0;j<bin.length;j = j+2){
    ch += map[bin.slice(j,j+2)]
  }
  return ch
}