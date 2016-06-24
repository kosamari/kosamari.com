function ChartSlider(elID, width, type){
  var w = width
  var h = 40
  var margin
  var types = {
    brightness :{
      extent: [-255, 255],
      default: 30
    },
    contrast : {
      extent: [0.1, 2],
      default: 1.2
    },
    posterize :{
      extent: [2, 20],
      default: 5
    },
    threshold :{
      extent: [0, 255],
      default: 127
    }
  }

  var x = d3.scale.linear()
  var brush = d3.svg.brush()
    .x(x)
    .extent(types[type].extent)
    .on('brush', brushed)

  d3.select(elID).selectAll("*").remove()
  var svg = d3.select(elID).append('svg')
  var sliders = svg.append('g').style('class','chart-slider').call(brush)

  function render() {
    margin = {top: 20, right: 10, bottom: 0, left: 10}

    sliders.selectAll('*').remove()
    x.domain(types[type].extent)
      .range([0, w - margin.left - margin.right ])
      .clamp(true)

    // ELEMENTS
    svg
      .attr('width', w)
      .attr('height', h)

    sliders
      .attr('width', w - margin.left*2 - margin.right*2)
      .attr('height', h - margin.top - margin.bottom)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    sliders.append('g')
        .attr('class', 'x axis')
        .style('font', '2vw sans-serif')
        .style('-webkit-user-select', 'none')
        .style(' -moz-user-select', 'none')
        .style(' user-select', 'none')
        .style('fill','#000')
        .call(d3.svg.axis()
          .scale(x)
          .orient('bottom')
          .ticks(0)
          .tickSize(0))
      .select('.domain')
        .style('fill','none')
        .style('stroke','#000')
        .style('stroke-opacity', 0.2)
        .style('stroke-width', (w*0.025)+'px')
        .style('stroke-linecap','round')

    sliders.append('circle')
        .attr('class', 'handle')
        .style('fill','#000')
        .style('strole-width','1.25px')
        .style('cursor', 'crosshair')
        .attr('r', 9)

    sliders
        .call(brush.extent([types[type].default, types[type].default]))
        .call(brush.event)
  }

  function brushed() {
    var value = brush.extent()[0]
    if (d3.event.sourceEvent) { // not a programmatic event
      value = x.invert(d3.mouse(this)[0])
      brush.extent([value, value])
    }

    sliders.select('circle')
      .attr('cx', x(value))
      .style('fill','#646464')

    var cValue = value | 0
    if(type === 'contrast'){
      if(value > 1.1){
        cValue = (value - 1) * 10
      }else if (value < 1) {
        cValue = value
      }else{
        cValue = 1
      }
    }
    var event = new CustomEvent('update-' + type, { 'detail':cValue })
    window.dispatchEvent(event)
  }

  function redraw(newWidth){
    w = newWidth
    h = 80
    render()
  }

  render()

  return {
    redraw : redraw
  }
}