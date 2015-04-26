var vislide =  (function(){
    'use strict';

    var dataset,
        index = 0,
        noTransition,
        autoplay,
        scatterPlotChart,
        totalCount = 0,
        containerFrame = '#vislide',
        slideContainer = '#slide-container',
        chartFrame = '#chart-container',
        slidePage = '.slide',
        leftArrow = '.fn-left-arrow',
        rightArrow = '.fn-right-arrow',
        slideRatio,
        templates = {};


/* Data Vis */
    function d3chart (){
        var types = dataset.map(function(d){return d.type})
        var guide;
        var xScale;
        var padding = 20;
        var margin = {top:10,bottom:10,left:10,rifht:10};
        var chartColor = {
            'slide':'#999999',
            'gif':'#F8555B',
            'math':'#07aaa4'
        };

        function drawChart(){
            $(chartFrame).html('');
            var w = getWidth();
            var h = getHeight() - (getHeight()*slideRatio);

            xScale = d3.scale.linear()
                                 .domain([0,d3.max(dataset, function(d) { return d.id; })])
                                 .range([padding, w - padding * 2]);
            var yScale = d3.scale.ordinal()
                                .domain(types)
                                .rangePoints([h - padding, padding]);

            var rScale = d3.scale.linear()
                                 .domain([0, d3.max(dataset, function(d) { return d.size; })])
                                 .range([h/20, h/5]);

            var svg = d3.select(chartFrame)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h-5);

            guide = svg.append("line")
                       .attr("y1", 5)
                       .attr("y2", h)
                       .style("stroke-width", 5)
                       .style("stroke", "#F8555B")
                       .attr("opacity", 1);

            svg.selectAll("circle")
               .data(dataset)
               .enter()
               .append("circle")
               .attr("cx", function(d) {return xScale(d.id);})
               .attr("cy", function(d) {return h/2;})
               .attr("r", function(d) {if(d.type=='math'){return rScale(d.size);}else{return 2}})
               .style("stroke-width", function(d){return rScale(d.size/5)})
               .style("stroke-opacity", function(d){if(d.type!=='slide'){return 0.5}else{return 0}}) // set the fill opacity
               .style("stroke", function(d){return chartColor[d.type]})
               .style("fill", function(d){return chartColor[d.type]})
               .on("click", function(d){vislide.navigateTo(d.id)});
        }

        function moveGuide(i){
            guide
                .transition()
                .duration(300)
                .ease('ease-in')
                .attr("x1", xScale(i))
                .attr("x2", xScale(i));
        }

        drawChart();
        return {
            draw:drawChart,
            move:moveGuide
        };
    }

/* Helper functions */
    function getWidth(){
        return $(containerFrame).width();
    }

    function getHeight(){
        return $(containerFrame).height();
    }


/* location hash changes handlers */
    function navigateTo(loc){
        loc = Math.max(Math.min(loc,totalCount - 1), 0);
        index = loc;
        move(index);
        scatterPlotChart.move(index);
        writeURL(index);
        return index;
    }

    function readURL() {
        var bits = window.location.hash.slice(2).split('/');
        var location = bits[0] ? parseInt( bits[0] ) : 0;
        navigateTo( location );
    }

    function writeURL(loc) {
        var url = '/';
        window.location.hash = url+loc;
    }


/* auto play functions */
    function autoSlide(){
        if(index>=totalCount-1){ index=-1; }
        slide('right');
    }

    function autoPlayStart(autoPlayInterval){
        autoSlide();
        autoplay = setInterval(autoSlide, autoPlayInterval);
    }

    function autoPlayStop(){
        clearInterval(autoplay);
    }


/* slide functions */
    function move(i){
        // console.log(getWidth())
        $(slideContainer).css({left: - i * getWidth()});
    }

    function slide(direction){
        var moveCount = {
            left: function countDown(){
                if(index<=0){return index;}
                index--;
                return index;
            },
            right:function countUp(){
                if(index>=totalCount-1){ return index;}
                index++;
                return index;
            }
        };
        moveCount[direction]();
        move(index);
        writeURL(index);
        return index;
    }


  /* Event Handlers */
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
            scatterPlotChart.draw();
            $(slideContainer).addClass('notransition');
            layoutSlides();
            clearTimeout(noTransition);
            noTransition = setTimeout(function() {
                $(slideContainer).removeClass('notransition');
            }, 100);
        });
    }

    function bindArrowClick(){
        if(leftArrow && rightArrow){
            $(leftArrow)
                .on("click", function(){ vislide.slide('left'); });
            $(rightArrow)
                .on("click", function(){ vislide.slide('right'); });
        }
    }


/* constants formaters */
    function addIDs(){
        for (var i = 0; i < dataset.length; i++) {
            dataset[i].id = i;
        }
    }

    function layoutSlides(){
        $(slidePage).css({width: getWidth(), height:getHeight()*slideRatio, left:getWidth()});
        $(slideContainer).css({width: getWidth() * totalCount, left: - index * getWidth()});
    }

    function appendSlides(){
        for (var i = 0;i < dataset.length;i++) {
            $(slideContainer).append(
                templates[dataset[i].template](dataset[i])
            );
        }
        layoutSlides();
    }

    function render(obj){
        dataset = obj.data || null;
        templates = obj.templates;
        totalCount = dataset.length;
        slideRatio = obj.slideRatio || 0.5;

        // add slides
        addIDs();
        appendSlides();

        // add data vis
        scatterPlotChart = d3chart();

        // add events
        bindWindowResize();
        bindArrowClick();
        document.addEventListener('keydown', onDocumentKeyDown, false);
        window.addEventListener('hashchange', onWindowHashChange, false);
        readURL();

        obj.callback();
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
