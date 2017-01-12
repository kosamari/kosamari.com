function PseudoColor(elID, chartWidth){
  // DATA
  var redData = new Uint8ClampedArray(256)
  var greenData = new Uint8ClampedArray(256)
  var blueData = new Uint8ClampedArray(256)

  redData.forEach(function(d,i){
    var n = 0
    if(i > 128 && i < 192){
      n = (i - 128) * (256 / (192-128))
    }
    if(i >= 192){
      n = 255
    }
    redData[i] = n
  })

  greenData.forEach(function(d,i){
    var n = 255
    if(i < 64){
      n = i * (256 / 64)
    }
    if(i >= 192){
      n = 255 - ((i - 191) * (256 / (256-192)))
    }
    greenData[i] = n
  })

  blueData.forEach(function(d,i){
    var n = 0
    if(i > 64 && i < 128){
      n = 255 - ((i-63) * (256 / (192-128)))
    }
    if(i < 65){
      n = 255
    }
    blueData[i] = n
  })

  // CHART SETUP
  var margin = {top: 40, right: 40, bottom: 50, left: 40},
      width =  chartWidth - margin.left - margin.right,
      height =  chartWidth * 0.8 - margin.top - margin.bottom

  var x = d3.scale.linear().range([0, width]).domain([0, 255])
  var y = d3.scale.linear().range([height, 0]).domain([0, 255])

  var rline = d3.svg.line().x(function(d, i) { return x(i) })
                             .y(function(d, i) { return y(d) })
  var gline = d3.svg.line().x(function(d, i) { return x(i) })
                             .y(function(d, i) { return y(d) })
  var bline = d3.svg.line().x(function(d, i) { return x(i) })
                             .y(function(d, i) { return y(d) })

  // ELEMENTS
  var svgEl = d3.select(elID).append('svg')
  var svg = svgEl.append('g')
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var rainbow = svg.append('g').attr('class', 'rainbow')
                  .attr('transform', 'translate(' + 0 + ',' + height + ')')

  // Guide line
  var xGuide = svg.append('g')
                .attr('class', 'd3s-guide-line')
                .style('display', 'none')
                .style('stroke', 'gray')
                .style('stroke-width', '1')

  // Axis
  var axisX =  svg.append('g')
  var axisY =  svg.append('g')

  // Line
  var rpath = svg.append('path')
                .style('stroke', 'rgb(255,0,0)')
                .style('stroke-width', '6px')
  var gpath = svg.append('path')
                .style('stroke', 'rgb(0,255,0)')
                .style('stroke-width', '6px')
  var bpath = svg.append('path')
                .style('stroke', 'rgb(0,0,255)')
                .style('stroke-width', '6px')

  // focus circle
  var rfocus = svg.append('g')
                .attr('class', 'focus')
                .style('display', 'none')
  var gfocus = svg.append('g')
                .attr('class', 'focus')
                .style('display', 'none')
  var bfocus = svg.append('g')
                .attr('class', 'focus')
                .style('display', 'none')
  var iguide = svg.append('g')
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

  // svg setup
  svgEl.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom + 50)

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
        .attr('x', width - 15)
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
      .attr('x', -10)
      .attr('transform', 'rotate(-90)')
      .style('fill', '#fff')
      .style('font', '2vw sans-serif')
  // mouse move event area
  svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', function() {
          rfocus.style('display', null)
          gfocus.style('display', null)
          bfocus.style('display', null)
          xGuide.style('display', null)
          iguide.style('display', null)
        })
        .on('mouseout', function() {
          rfocus.style('display', 'none')
          gfocus.style('display', 'none')
          bfocus.style('display', 'none')
          xGuide.style('display', 'none')
          iguide.style('display', 'none')
        })
        .on('mousemove', mousemove)


  rpath.datum(redData)
  rpath.attr('class', 'line')
    .attr('d', rline)
    .style('fill', 'none')

  gpath.datum(greenData)
  gpath.attr('class', 'line')
    .attr('d', gline)
    .style('fill', 'none')

  bpath.datum(blueData)
  bpath.attr('class', 'line')
    .attr('d', bline)
    .style('fill', 'none')

  rfocus.append('circle')
    .attr('r', 7)
    .style('fill','rgba(255,0,0,.8)')
    .style('stroke', '#fff')

  rfocus.append('text').attr('class', 'output-text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill', '#fff')
    .style('font-size', '3vw')

  gfocus.append('circle')
    .attr('r', 7)
    .style('fill','rgba(0,255,0,.8)')
    .style('stroke', '#fff')

  gfocus.append('text').attr('class', 'output-text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill', '#fff')
    .style('font-size', '3vw')

  bfocus.append('circle')
    .attr('r', 7)
    .style('fill','rgba(0,0,255,.8)')
    .style('stroke', '#fff')

  bfocus.append('text').attr('class', 'output-text')
    .attr('x', 10)
    .attr('dy', '.35em')
    .style('fill', '#fff')
    .style('font-size', '3vw')

  iguide.append('text').attr('class', 'input-text')
    .attr('y', height + 30)
    .attr('x', 0)
    .style('fill', '#fff')
    .style('font-size', '2vw')

  xGuide.append('line')

  redData.forEach(function(d, i){
    rainbow.append('rect')
          .attr('class', 'rainbow-rect')
          .attr('fill','rgb('+d+','+greenData[i]+','+blueData[i]+')')
          .attr('y', 40)
          .attr('x', i * width/256)
          .attr('width', width/256)
          .attr('height', 30)
          .attr('stroke', 'rgb('+d+','+greenData[i]+','+blueData[i]+')')
  })


  function chartResize(w, h){

    width = w - margin.left - margin.right,
    height = ((h||w) * 0.8) - margin.top - margin.bottom

    axisX.select('text').attr('x', width - 15)
    svgEl.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom  + 50)
    svg.select('.transform')
       .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    x.range([0, width])
    y.range([height, 0])

    rainbow.attr('transform', 'translate(' + 0 + ',' + height + ')')
    d3.select(elID).selectAll(".rainbow-rect").remove()
    redData.forEach(function(d, i){
      rainbow.append('rect')
            .attr('class', 'rainbow-rect')
            .attr('fill','rgb('+d+','+greenData[i]+','+blueData[i]+')')
            .attr('y', 40)
            .attr('x', i * width/256)
            .attr('width', width/256)
            .attr('height', 30)
            .attr('stroke', 'rgb('+d+','+greenData[i]+','+blueData[i]+')')
    })

    // axis
    svg.select('g .x.axis')
        .attr('transform', 'translate(0,' + y(0) + ')')
        .call(d3.svg.axis().scale(x).orient('bottom').ticks(0).outerTickSize(0))

    svg.select('g .y.axis')
        .call(d3.svg.axis().scale(y).orient('left').ticks(0).outerTickSize(0))

    svg.select('.overlay')
        .attr('width', width)
        .attr('height', height)

    rpath.attr('d', rline)
    gpath.attr('d', gline)
    bpath.attr('d', bline)
  }

  function mousemove() {
    var input = x.invert(d3.mouse(this)[0]) | 0
    rfocus.attr('transform', 'translate(' + x(input) + ',' + y(redData[input]) + ')')
    // rfocus.select('.output-text').text(redData[input])
    gfocus.attr('transform', 'translate(' + x(input) + ',' + y(greenData[input]) + ')')
    // gfocus.select('.output-text').text(greenData[input])
    bfocus.attr('transform', 'translate(' + x(input) + ',' + y(blueData[input]) + ')')
    // bfocus.select('.output-text').text(blueData[input])
    iguide.select('.input-text').text(input).attr('x', x(input)+ 2).attr('y', height + 30)

    xGuide.select('line').attr('x1', x(input))
          .attr('y1',  0)
          .attr('x2', x(input))
          .attr('y2',  height + margin.bottom - 10)
  }

  return {
    redraw: chartResize
  }
}