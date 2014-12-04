'use strict';
var Timeline =  (function(){
  var timelinedataset = null,
    performancedataset = null,
    resize = true,
    index = 0,
    noTransition,
    autoplay,
    totalCount = 0,
    timelineFrame = '#timeline',
    timelineSlide = '.slide',
    slideContents = '.slide-contents',
    slideContainer = '#tl-slide-container',
    navigationBtn = '.tl-navigation',
    controlHeight = 220,
    navigationWidth = 50,
    format = d3.time.format('%Y-%m-%d'),
    d3Controller=null,
    types = ['person','release','event'],
    templates = {};

  function d3chart (timelineData, graphData, timelineFrameSelec, types){
    var extent,
      textdisplay = true,
      controlCircleRadius = 4,
      focusRadius = 10,
      focusRadiusEx = 13,
      margin = {top: 10, right: 20, bottom:0, left: 20},
      outerWidth = $(timelineFrameSelec).width(),
      innerWidth = outerWidth - margin.left - margin.right,
      // graphMargin = {top: 10, right: 0, bottom: 0, left: 0},
      controlMargin = {top: 10, right: 0, bottom: 10, left: 0},
      focusMargin = {top: 10, right: 0, bottom: 20, left: 0},
      // graphSvgHeight = 80,
      // graphHeight = graphSvgHeight - graphMargin.top - graphMargin.bottom,
      focusSvgHeight = 160,
      focusHeight = focusSvgHeight - focusMargin.top - focusMargin.bottom,
      controlSvgHeight = 30,
      controlHeight = controlSvgHeight - controlMargin.top - controlMargin.bottom,
      controlSelector = '#tl-control',
      // graphSelector = '#tl-graph',
      focusSelector = '#tl-focus',
      brushRange = 15552000000, //6 months
      textdisplaywidth = 31104000000, //1 year
      customTimeFormat = d3.time.format.multi([
        ['.%L', function(d) { return d.getMilliseconds(); }],
        [':%S', function(d) { return d.getSeconds(); }],
        ['%I:%M', function(d) { return d.getMinutes(); }],
        ['%I %p', function(d) { return d.getHours(); }],
        ['%b %d', function(d) { return d.getDay() && d.getDate() != 1; }],
        ['%b %d', function(d) { return d.getDate() != 1; }],
        ['%b %Y', function(d) { return d.getMonth() && d.getYear(); }],
        ['%b %Y', function() { return true; }]
      ]);
      
    /*
    * D3 CONSTRUCTION FUNCTIONS
    */
    function datasetPluck(data,key){
      return data.map(function(d) { return d[key]; });
    }
    function createTimeScale(range){
      return d3.time.scale().range(range);
    }
    function createLinearScale(range){
      return d3.scale.linear().range(range);
    }
    function createOrdinalScale(range){
      return d3.scale.ordinal().rangePoints(range);
    }
    function createXDomain(timelineData,graphData,key,padding){
      var domain = datasetPluck(timelineData,key).concat(datasetPluck(graphData,key));
      return  [d3.min(domain)-padding, d3.max(domain)-0+padding];
    }
    function createAxis(scale,orient){
      return d3.svg.axis().scale(scale).orient(orient);
    }
    function drawSVG(el, width, height, margin, id) {
      return d3.select(el).append('svg').attr('width', width).attr('height', height)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .append('g')
          .attr('id', id);
    }
    function createLineGraph(xScale,xKey,yScale,yKey,interpolate){
      return d3.svg.line()
        .interpolate(interpolate)
        .x(function(d) { return xScale(d[xKey]); })
        .y(function(d) { return yScale(d[yKey]); });
    }
    function createAreaGraph(xScale,xKey,yScale,yKey,interpolate){
      return d3.svg.area()
        .interpolate(interpolate)
        .x(function(d) { return xScale(d[xKey]); })
        .y0(100)
        .y1(function(d) { return yScale(d[yKey]); });
    }
    function drawclipPath(canvas,width,height,id){
      return canvas.append('defs').append('clipPath')
        .attr('id', id)
        .append('rect')
          .attr('width', width)
          .attr('height', height);
    }
    function drawRectangle(canvas,width,height){
      return canvas.append('rect')
        .attr('width', width)
        .attr('height', height);
    }
    function drawAxis(canvas, axisGenerator, attrClass, translateLoc) {
      return canvas.append('g')
        .attr('class', attrClass)
        .attr('transform', 'translate('+translateLoc+ ')')
        .call(axisGenerator);
    }

    /*
    Actual Drawing Part
    This D3 timeline has 3 SVG parts
    graph : impression graph chart
    focus : zoomabile/clickable area
    control : scroll bar part (it's using D3 brush) 
    */
    function drawChart(){
      //init
      outerWidth = $(timelineFrameSelec).width();
      innerWidth = outerWidth - margin.left - margin.right;
      $(controlSelector).html('');
      // $(graphSelector).html('');
      $(focusSelector).html('');

      /*
      * EVENT FUNCTIONS
      */
      function focusTextDisplay(){
        if((textdisplaywidth < extent[1] - extent[0]) && textdisplay){
          textdisplay = false;
          focusItems.selectAll('text').style("opacity",0)
        }
        if(!(textdisplaywidth < extent[1] - extent[0]) && !textdisplay){
          textdisplay = true;
          focusItems.selectAll('text').style("opacity",1)
        }
      }
      function moveDomElements(){
        // graph.select('.line').attr('d', graphLine);
        // graph.select('.x.axis').call(graphAxisX);
        focus.select('.x.axis').call(focusAxisX);
        focusItems.selectAll('circle').attr('cx', function(d) { return focusX(d.date); });
        focusItems.selectAll('text').attr('x', function(d) { return focusX(d.date); });
      }
      function zoomed(){
        extent = brush.empty() ? controlX.domain() : brush.extent();
        // graphX.domain(focusX.domain());
        focusTextDisplay();
        moveDomElements();
        brush.extent(focusX.domain());
        gBrush.call(brush);
      }

      function brushmove(center) {
        if(center){ brushcenter(center); return;}
        extent = brush.empty() ? controlX.domain() : brush.extent();
        focusX.domain(extent);
        // graphX.domain(extent);
        focusTextDisplay();
        moveDomElements();
        zoom.x(focusX);
        zoom.translate();
      }

      function brushcenter(location) {
        extent = brush.extent();
        var target = location || controlX.invert(d3.mouse(d3.event.target)[0]),
            size = extent[1] - extent[0],
            domain = controlX.domain(),
            x0 = domain[0] - 0 + size / 2,
            x1 = domain[1] - size / 2,
            center = Math.max(x0, Math.min(x1, target));
        focusX.domain(extent);
        gBrush
          .transition()
          .duration(500)
          .call(brush.extent([center - size / 2, center -0 + size / 2]))
          .call(brush.event);
        d3.event.stopPropagation();
      }

      function circleClick(d){
        $('#circle'+d.id+ ' circle').css({'stroke-width': '5px'});
        $("#tl-focus .circle").not('#circle'+d.id+ ' circle').css({'stroke-width': '0px'});
        brushmove(controlX.invert(controlX(d.date)));
        Timeline.navigateTo(d.id);
      }

      /*
      * SETTING UP YOUR CART!
      */
      // X scale and Domain Setting
      var x = createTimeScale([0, innerWidth]);
          x.domain(createXDomain(timelineData,graphData,'date',brushRange/2));
      // var graphX = createTimeScale([0, innerWidth]); graphX.domain(x.domain());
      var focusX = createTimeScale([0, innerWidth]); focusX.domain(x.domain());
      var controlX = createTimeScale([0, innerWidth]);
          controlX.domain(x.domain());

      // Y scale and Domain Setting
      // var graphY = createLinearScale([graphHeight,0]);
      //     graphY.domain([0, d3.max(datasetPluck(graphData,'impressions'))]);
      var focusY = createOrdinalScale([focusHeight-focusRadiusEx*1.5, focusRadiusEx*1.5]);
          focusY.domain(types);
      var controlY = createOrdinalScale([controlHeight, 0]);
          controlY.domain(types);

      //Axis Setting
      // var graphAxisX = createAxis(graphX,'bottom').ticks(0);
      var focusAxisX = createAxis(focusX,'bottom').tickFormat(customTimeFormat);
      var controlAxisX = createAxis(controlX,'bottom');
          controlAxisX.ticks(d3.time.year);
      // var graphAxisY = createAxis(graphY,'left');
      var currentExtent = extent || [x.domain()[0], x.domain()[0]-0+brushRange];
      //Generators
      // var graphLine = createAreaGraph(graphX,'date',graphY,'impressions','basis');
      var zoom = d3.behavior.zoom()
            .x(focusX)
            .scaleExtent([1,20])
            .on('zoom', zoomed);
      var brush = d3.svg.brush()
            .x(controlX)
            .extent( currentExtent)
            .on('brush', brushmove);
      /*
      * START DRAWING
      */
      /* GRAPH */
      // var graph = drawSVG(graphSelector, outerWidth, graphSvgHeight, margin,'graph');
      // graph.call(zoom);
      // drawclipPath(graph, innerWidth, graphHeight, 'graphClip');
      // drawRectangle(graph, innerWidth, graphHeight).style('opacity','0');
      // drawAxis(graph, graphAxisX, 'x axis',[0,graphHeight]);

      // graph.append('path')
      //     .datum(graphData)
      //     .attr('class', 'line')
      //     .attr('d', graphLine);

      /* FOCUS */
      var focus = drawSVG(focusSelector, outerWidth, focusSvgHeight, margin,'focus');
      focus.call(zoom);
      drawclipPath(focus, innerWidth, focusHeight+focusMargin.top+focusMargin.bottom, 'focusClip');
      drawRectangle(focus, innerWidth, focusHeight).style('opacity','0');
      drawAxis(focus, focusAxisX, 'x axis',[0,focusHeight]);

      var focusItems = focus.selectAll('circle')
          .data(timelineData)
          .enter()
          .append('g')
          .attr('id', function(d) { return 'circle'+d.id; })
            .on('click', circleClick);
            

          focusItems.append('circle')
            .attr('class', function(d){return 'circle '+ d.type;})
            .attr('cx', function(d) { return focusX(d.date); })
            .attr('cy', function(d) { return focusY(d.type); })
            .attr('r', function(d){ return focusRadius; });
            

          focusItems.append('text')
            .attr('class', 'focus-text')
            .attr('x', function(d) { return focusX(d.date);})
            .attr('y', function(d) { return focusY(d.type);})
            .attr('transform', 'translate(' + focusRadiusEx + ',' + focusRadius/2 + ')')
            .text(function(d) { return d.guideText; });

      /* CONTROL */
      var control = drawSVG(controlSelector, outerWidth, controlSvgHeight+controlMargin.top+controlMargin.bottom, margin,'control');
      drawclipPath(control, innerWidth, controlHeight+20, 'controlClip');
      drawAxis(control, controlAxisX, 'x axis',[0,controlHeight]);
      control.selectAll('circle')
          .data(timelineData)
          .enter()
          .append('circle')
            .attr('cx', function(d) { return controlX(d.date); })
            .attr('cy', function(d) { return controlHeight; })
            .attr('r', function(d){ return controlCircleRadius; });

      var gBrush = control.append('g').attr('class', 'brush').call(brush).call(brush.event);
        gBrush.selectAll('rect')
          .attr('height', controlHeight+controlMargin.top)
        gBrush.select('.background')
          .on('mousedown.brush', brushcenter)
          .on('touchstart.brush', brushcenter);
    }

    drawChart();

    return {
        draw:drawChart
      };
  }

  function getWidth(){
    return $(timelineFrame).width();
  }

  function getHeight(){
    return $(timelineFrame).height();
  }

  function setTotalCount(){
    totalCount = $(timelineSlide).length;
    return totalCount;
  }

  function navigateTo(loc){
    loc = Math.max(Math.min(loc,totalCount - 1), 0);
    index = loc;
    move(index);
    writeURL(index);
    return index;
  }

  function moved3chart(id){
    var e = document.createEvent('UIEvents');
    e.initUIEvent('click');
    d3.select('#circle'+id).node().dispatchEvent(e);
  }
  function readURL() {
    var bits = window.location.hash.slice(2).split('/');
    var location = bits[0] ? parseInt( bits[0] ) : 0;
    navigateTo( location );
    moved3chart(index);
  }

  function writeURL(loc) {
    var url = '/';
    window.location.hash = url+loc;
  }

  function countDown(){
    if(index<=0){return index;}
    index--;
    return index;
  }

  function countUp(){
    if(index>=totalCount-1){ return index;}
    index++;
    return index;
  }

  function autoPlayStart(autoPlayInterval){
    autoSlide();
    autoplay = setInterval(autoSlide, autoPlayInterval);
  }

  function autoPlayStop(){
    clearInterval(autoplay);
  }

  function move(i){
    $(slideContainer).css({left: - i * getWidth()});
  }

  function slide(direction){
    var moveCount = {
      left: countDown,
      right:countUp
    };
    moveCount[direction]();
    move(index);
    moved3chart(index);
    writeURL(index);
    return index;
  }

  function autoSlide(){
    if(index>=totalCount-1){ index=-1; }
    slide('right');
  }

  function layoutSlides(){
    $(timelineSlide).css({width: getWidth() , height:getHeight()-controlHeight, left:getWidth()});
    $(slideContents).css({width: (getWidth() - navigationWidth*2)});
    $(slideContainer).css({width: getWidth() * totalCount, left: - index * getWidth()});
  }

  function appendSlides(){
    for (var i = 0;i < timelinedataset.length;i++) {
      $(slideContainer).append(
        templates[timelinedataset[i].template](timelinedataset[i])
      );
    }
  }

  //Handler for the document level 'keydown' event.
  // @param {Object} event
  function onDocumentKeyDown( event ) {
    if( event.keyCode >= 37 && event.keyCode <= 40 ) {
      var keys = {
        37: function(){ slide('left'); },
        38: function(){},
        39: function(){ slide('right'); },
        40: function(){}
      };
      keys[event.keyCode]();
      event.preventDefault();
    }
  }

  function onWindowHashChange( event ) {
    readURL();
  }

  function bindWindowResize(){
    $(window).resize(function() {
      $(slideContainer).addClass('notransition');
      layoutSlides();
      clearTimeout(noTransition);
      noTransition = setTimeout(function() {
        $(slideContainer).removeClass('notransition');
      }, 100);
    });
  }
  function sortByTimeStamp(datasets){
    datasets.forEach(function(dataset){
      dataset.sort(function(a,b){
        a.date = format.parse(a.timestamp); // returns a Date
        b.date = format.parse(b.timestamp); // returns a Date
        return  a.date - b.date;
      });
    });
  }
  function addIDs(datasets){
    datasets.forEach(function(dataset){
      for (var i = 0; i < dataset.length; i++) {
        dataset[i].id = i;
      }
    });
  }

  function foramtData(){
    sortByTimeStamp([timelinedataset,performancedataset]);
    addIDs([timelinedataset]);
  }

  function bindArrowClick(){
    if($(timelineFrame+' '+navigationBtn)){
      $(timelineFrame+' '+navigationBtn+".left")
        .on("click", function(){ Timeline.slide('left') });
      $(timelineFrame+' '+navigationBtn+".right")
        .on("click", function(){ Timeline.slide('right') });
    }
  }

  function setTemplates(tmp){
    if(!arguments){return templates;}
    templates = tmp;
    return templates;
  }

  function setTypes(t){
    if(!arguments){return types;}
    types = t;
    return types;
  }

  function render(obj){
    timelinedataset = obj.timelinedata;
    performancedataset = obj.performancedata;
    setTemplates(obj.templates);
    setTypes(obj.types);
    foramtData();
    appendSlides();
    d3Controller = d3chart(timelinedataset, performancedataset, timelineFrame, types);
    $(window).bind('resize', function() {
      d3Controller.draw();
    });
    setTotalCount();
    layoutSlides();
    bindWindowResize();
    bindArrowClick();
    document.addEventListener('keydown', onDocumentKeyDown, false);
    window.addEventListener('hashchange', onWindowHashChange, false);
    readURL();
  }

  /* Public API */
  return {
    render: render,
    slide: slide,
    navigateTo: navigateTo,
    autoPlayStart:autoPlayStart,
    autoPlayStop:autoPlayStop
  };

})();
