function SlideChart(elID, chartWidth){
  // DATA
  var data = new Uint8ClampedArray(256)
  var updateArray = {
    base: function(){
      data.forEach(function(d, i){ data[i] = i})
    },
    invert: function(){
      data.forEach(function(d, i){ data[i] = 255 - i})
    },
    brightness: function(option){
      data.forEach(function(d, i){
        data[i] = i + option
      })
    },
    contrast: function(option){
      data.forEach(function(d, i){
        data[i] = (i - 128) * option + 128
      })
    },
    threshold: function(option){
      data.forEach(function(d, i){
        data[i] = i < option ? 0 : 255
      })
    },
    posterize: function(option){
      var colorSize = 256 / (option - 1) // 23
      var stepSize = 256 / option //21
      var l, _li
      for (l = 0; l < option; l++) {
        for (s = 0; s < stepSize; s++) {
          _li = Math.round(l * stepSize + s)
          if (l === option - 1) {
            data[_li] = 255
            continue
          }
          data[_li] = l * colorSize
        }
      }
    },
    solarize: function(){
      var stepSize = 256 / 3
      var l, _li
      for (l = 0; l < 3; l++) {
        for (s = 0; s < stepSize; s++) {
          _li = Math.round(l * stepSize + s)
          if((l + 1) % 2) {
            if (l + 1 >= stepSize) {
            data[_li] = 255
            continue
            }
            data[_li] = s * (256 / stepSize)
            continue
          }
          data[_li] = 255 - (s * (256 / stepSize))
        }
      }
    }
  }

  // CHART SETUP
  var margin = {top: 40, right: 40, bottom: 40, left: 60},
      width =  chartWidth - margin.left - margin.right,
      height =  chartWidth * 0.8 - margin.top - margin.bottom

  var x = d3.scale.linear().range([0, width]).domain([0, 255])
  var y = d3.scale.linear().range([height, 0]).domain([0, 255])

  var line = d3.svg.line().x(function(d, i) { return x(i) })
                             .y(function(d, i) { return y(d) })

  // ELEMENTS
  var svgEl = d3.select(elID).append('svg')
  var svg = svgEl.append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  // guide line
  var xGuide = svg.append('g')
                .attr('class', 'd3s-guide-line')
                .style('display', 'none')
                .style('stroke', 'gray')
                .style('stroke-width', '1')

  var yGuide = svg.append('g')
                .attr('class', 'd3s-guide-line')
                .style('display', 'none')
                .style('stroke', 'gray')
                .style('stroke-width', '1')
  // Axis
  var axisX =  svg.append('g')
  var axisY =  svg.append('g')
  // Line
  var path = svg.append('path')
                .style('stroke', 'url(#line-gradient)')
                .style('stroke-width', '6px')

  // focus circle
  var focus = svg.append('g')
                .attr('class', 'focus')
                .style('display', 'none')

  var iguide = svg.append('g')
                .style('display', 'none')

  var oguide = svg.append('g')
                .style('display', 'none')

  // focus circle
  var redCircle = svg.append('g')
                .attr('class', 'red-circle')
                .style('display', 'none')
  var greenCircle = svg.append('g')
                .attr('class', 'green-circle')
                .style('display', 'none')
  var blueCircle = svg.append('g')
                .attr('class', 'blue-circle')
                .style('display', 'none')

  // INITIALIZE
  updateArray['base']()

  // svg setup
  svgEl.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
  // axis
  axisX.attr('class', 'x axis')
      .attr('transform', 'translate(0,' + y(0) + ')')
      .call(d3.svg.axis()
              .scale(x)
              .orient('bottom')
              .tickSize(0)
              .ticks(0)
              .outerTickSize(0)
      )
      .append('text')
        .text('input')
        .style('text-anchor', 'end')
        .attr('x', width)
        .attr('dy', '-.5em')
        .style('fill', '#fff')
        .style('font', '2vw sans-serif')

  axisY.attr('class', 'y axis')
      .call(d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickSize(0)
        .ticks(0)
        .outerTickSize(0)
      )
      .style('fill', '#fff')
      .style('font', '2vw sans-serif')
    .append('text')
      .text('output')
      .style('text-anchor', 'end')
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .style('fill', '#fff')
      .style('font', '2vw sans-serif')

  // mouse move event area
  svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', function() {
          focus.style('display', null)
          iguide.style('display', null)
          oguide.style('display', null)
          xGuide.style('display', null)
          yGuide.style('display', null)
        })
        .on('mouseout', function() {
          focus.style('display', 'none')
          iguide.style('display', 'none')
          oguide.style('display', 'none')
          xGuide.style('display', 'none')
          yGuide.style('display', 'none')
        })
        .on('mousemove', mousemove)


  path.datum(data)
  path.attr('class', 'line')
    .attr('d', line)
    .style('fill', 'none')

  focus.append('circle')
    .attr('r', 7)
    .style('fill', 'rgba(0,0,0,0.3)')
    .style('stroke', '#fff')

  focus.append('text').attr('class', 'output-text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill', '#fff')
    .style('font-size', '3vw')

  iguide.append('text').attr('class', 'input-text')
    .style('fill', '#fff')
    .style('font-size', '2vw')

  oguide.append('text').attr('class', 'output-text')
    .style('fill', '#fff')
    .style('font-size', '2vw')

  redCircle.append('circle')
    .attr('r', 7)
    .style('fill','red')
    .style('stroke', 'none')

  redCircle.append('text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill','red')
    .style('font-size', '3vw')

  greenCircle.append('circle')
    .attr('r', 7)
    .style('fill','green')
    .style('stroke', 'none')

  greenCircle.append('text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill','green')
    .style('font-size', '3vw')

  blueCircle.append('circle')
    .attr('r', 7)
    .style('fill','blue')
    .style('stroke', 'none')

  blueCircle.append('text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill','blue')
    .style('font-size', '3vw')

  xGuide.append('line')
  yGuide.append('line')

  // linear gradient
  svg.append('radialGradient')
          .attr('id', 'line-gradient')
          .attr('fx', '50%')
          .attr('fy', '50%')
          .attr('r', '65%')
      .selectAll('stop')
          .data([
              {offset: '0%', color: 'rgba(255,0,0,1)'},
              {offset: '20%', color: 'rgba(0,255,0,1)'},
              {offset: '40%', color: 'rgba(0,0,255,1)'},
              {offset: '60%', color: 'rgba(255,0,0,1)'},
              {offset: '80%', color: 'rgba(0,255,0,1)'},
              {offset: '100%', color: 'rgba(0,0,255,1)'}
          ])
      .enter().append('stop')
          .attr('offset', function(d) { return d.offset })
          .attr('stop-color', function(d) { return d.color })

  function chartResize(w, h){

    width = w - margin.left - margin.right,
    height = (h||w) * 0.8 - margin.top - margin.bottom

    axisX.select('text').attr('x', width)
    svgEl.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom)
    svg.select('.transform')
       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    x.range([0, width])
    y.range([height, 0])

    // axis
    svg.select('g .x.axis')
        .attr('transform', 'translate(0,' + y(0) + ')')
        .call(d3.svg.axis().scale(x).orient('bottom').ticks(0).outerTickSize(0))

    svg.select('g .y.axis')
        .call(d3.svg.axis().scale(y).orient('left').ticks(0).outerTickSize(0))

    svg.select('.overlay')
        .attr('width', width)
        .attr('height', height)

    path.attr('d', line)
  }

  function showGuideCircle(){
    redCircle.style('display', null)
    greenCircle.style('display', null)
    blueCircle.style('display', null)
  }

  function hideGuideCircle(){
    redCircle.style('display', 'none')
    greenCircle.style('display', 'none')
    blueCircle.style('display', 'none')
  }

  function showRGBLine(){
    path.style('display', null)
    path.style('stroke', 'url(#line-gradient)')
  }

  function showGrayLine(){
    path.style('stroke', 'gray')
  }

  function updateColor(type, opt) {
    showRGBLine()
    updateArray[type](opt)
    updateLine()
  }

  function updateGrayScale(type, opt) {
    showGrayLine()
    updateArray[type](opt)
    updateLine()
  }

  function updateLine(){
    path.transition()
        .duration(300)
        .ease('linear')
        .attr('d', line)
  }

  function drawCircleGuide(r, g, b) {
    showGuideCircle()
    redCircle.attr('transform', 'translate(' + x(r) + ',' + y(data[r]) + ')')
    redCircle.select('text').text(data[r])

    greenCircle.attr('transform', 'translate(' + x(g) + ',' + y(data[g]) + ')')
    greenCircle.select('text').text(data[g])

    blueCircle.attr('transform', 'translate(' + x(b) + ',' + y(data[b]) + ')')
    blueCircle.select('text').text(data[b])
  }

  function mousemove() {
    var input = x.invert(d3.mouse(this)[0]) | 0
    var output = data[input]
    focus.attr('transform', 'translate(' + x(input) + ',' + y(output) + ')')

    oguide.select('.output-text').text(output)
      .attr('x', -margin.left + 15).attr('y', y(output))
    iguide.select('.input-text').text(input)
      .attr('x', x(input) + 2).attr('y', height + 20)

    xGuide.select('line').attr('x1', x(input))
          .attr('y1',  y(output))
          .attr('x2', x(input))
          .attr('y2',  height + margin.bottom - 10)

    yGuide.select('line').attr('x1', - margin.left + 10)
          .attr('y1', y(output))
          .attr('x2', x(input))
          .attr('y2', y(output))
  }

  return {
    redraw: chartResize,
    drawCircleGuide: drawCircleGuide,
    hideGuideCircle: hideGuideCircle,
    updateColor: updateColor,
    updateGrayScale: updateGrayScale
  }
}