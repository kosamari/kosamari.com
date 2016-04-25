function PixelColor(elID, width, color){
  // SETUP
  var stack = true
  var w = width
  var h = width/2
  var margin
  var handle = {}
  var slider = {}
  var array = ['r','g','b','a']
  var startValue = color || [57,85,205,255]

  var y = d3.scale.linear()
  var x = d3.scale.linear()

  var brush = {
    r: d3.svg.brush().y(y).extent([0, 0]).on('brush', function(){ brushed.call(this, 'r') }),
    g: d3.svg.brush().y(y).extent([0, 0]).on('brush', function(){ brushed.call(this,'g') }),
    b: d3.svg.brush().y(y).extent([0, 0]).on('brush', function(){ brushed.call(this,'b') }),
    a: d3.svg.brush().y(y).extent([0, 0]).on('brush', function(){ brushed.call(this,'a') })
  }

  var svg = d3.select(elID).append('svg')
  var sliders = svg.append('g').style('class','parent')
  var color = svg.append('g').style('class','parent')

  function render() {
    margin = {top: h*0.15, right: w*0.10, bottom: h*0.10, left: w*0.10}

    sliders.selectAll('*').remove()
    color.selectAll('*').remove()

    y.domain([0, 255])
      .range([h - margin.bottom - margin.top, 0])
      .clamp(true)
    x.domain([0, 3])
      .range([0, w/2 - margin.left - margin.right ])
      .clamp(true)

    // ELEMENTS
    svg
      .attr('width', w + margin.left + margin.right)
      .attr('height', h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


    // SLIDERS
    sliders.append('rect')
      .attr('class', 'bg-box')
      .attr('width', w/2)
      .attr('height', h)
      .style('fill', 'rgba(0,0,0,1)')
      .style('stroke', 'black')
      .style('stroke-width', '2px')
        .attr('transform', 'translate('+ -margin.left + ','+ -margin.top +')')

    sliders
      .attr('width', w/2)
      .attr('height', h + margin.top + margin.bottom)
      .attr('transform', 'translate(' + margin.left*2 + ',' + margin.top*2 + ')')

    array.forEach(function(el,i){appendSliders(el,i)})

    // PIXEL
    color
      .attr('width', w/2)
      .attr('height', h)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


    color.append('rect')
      .attr('class', 'color-overlay')
      .attr('width', w/2)
      .attr('height', h)
      .style('fill', 'rgba(255,255,255,1)')
      .style('stroke', 'black')
      .style('stroke-width', '2px')
      .on('click', function(){
        stack ? reveal() : stackup()
      })

    // EYES
    color.append('ellipse')
            .attr('cx', w/10)
            .attr('cy', w/9)
            .attr('rx', w/20)
            .attr('ry', w/11)
            .style('fill', 'rgba(255,255,255,1)')
            .style('stroke', 'rgba(0,0,0,1)')
            .style('stroke-width', '2px')
    color.append('ellipse')
            .attr('cx', w/10)
            .attr('cy', w/6.5)
            .attr('rx', w/30)
            .attr('ry', w/30)
            .style('fill', 'rgba(0,0,0,1)')
    color.append('ellipse')
            .attr('cx', w/4.8)
            .attr('cy', w/9)
            .attr('rx', w/20)
            .attr('ry', w/11)
            .style('fill', 'rgba(255,255,255,1)')
            .style('stroke', 'rgba(0,0,0,1)')
            .style('stroke-width', '2px')
    color.append('ellipse')
            .attr('cx', w/4.8)
            .attr('cy', w/6.5)
            .attr('rx', w/30)
            .attr('ry', w/30)
            .style('fill', 'rgba(0,0,0,1)')
  }

  function appendSliders(color, i){
    sliders.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+ x(i) + ', 0)')
        .style('font', '2vw sans-serif')
        .style('-webkit-user-select', 'none')
        .style(' -moz-user-select', 'none')
        .style(' user-select', 'none')
        .style('fill','#fff')
        .call(d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickValues(y.domain())
          .tickSize(0)
          .tickPadding(w*0.02))
      .select('.domain')
        .style('fill','none')
        .style('stroke','#fff')
        .style('stroke-opacity', 0.2)
        .style('stroke-width', (w*0.025)+'px')
        .style('stroke-linecap','round')


    var slider = sliders.append('g')
        .attr('class', 'slider-'+color)
        .call(brush[color])

    handle[color] = slider.append('circle')
        .attr('class', 'handle')
        .style('fill','#fff')
        .style('strole-width','1.25px')
        .style('cursor', 'crosshair')
        .attr('transform', 'translate('+ x(i) + ', 0)')
        .attr('r', 9)

    slider
        .call(brush[color].event)
      .transition()
        .call(brush[color].extent([startValue[i], startValue[i]]))
        .call(brush[color].event)
  }

  function brushed(color) {
    var colors = {
      r: [255, 0, 0],
      g: [0, 255, 0],
      b: [0, 0, 255],
      a: [100,100,100]
    }
    var value = brush[color].extent()[1]
    if (d3.event.sourceEvent) { // not a programmatic event
      value = y.invert(d3.mouse(this)[1])
      brush[color].extent([value, value])
    }

    var val = value | 0
    var c = colors[color]
    handle[color]
      .attr('cy', y(value))
      .style('fill','#646464')
      .style('stroke','rgb('+c[0]+','+c[1]+','+c[2]+')' )
      .style('stroke-width', 10)

    if(color !== 'a'){
      handle[color]
        .attr('r', w*0.03/300 * val + 5)
        .style('fill','rgb('+c[0]+','+c[1]+','+c[2]+')' )
        .style('stroke-opacity', 0.8)
        .style('stroke-width',(15/255)*value )
    }


    var r = brush.r.extent()[0] | 0
    var g = brush.g.extent()[0] | 0
    var b = brush.b.extent()[0] | 0
    var a = (brush.a.extent()[0] | 0)  / 255
    d3.select('.color-overlay').style(
      'fill', 'rgba('+r+','+g+','+b+','+a+')')
  }

  function redraw(newWidth){
    w = newWidth
    h = newWidth/2
    render()
    if(stack) {reveal()}
  }

  function reveal(){
    color.transition()
        .duration(1000)
        .attr('transform', 'translate(' + (margin.left + w/2) + ',' + margin.top + ')')
    stack = false
  }

  function stackup(){
    color.transition()
        .duration(1000)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    stack = true
  }

  window.addEventListener('pixel-stack', stackup)
  window.addEventListener('pixel-reveal', reveal)
  render()

  return {
    redraw : redraw
  }
}