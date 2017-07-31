/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.timeline = function (yearSelected) {
    "use strict";


    var that = {},
        margin = {
            top: 20,
            right: 0,
            bottom: 20,
            left: 0
        },
        width = $("#map").width() - margin.left - margin.right - 35,
        height = 80 - margin.top - margin.bottom,
        brushScale, x, y, svg2, brushTime,played,playbackIntervall;

    function drawTimeGraph(timelineData) {
        console.log("init Timeline");
        initGraph(timelineData);
        initBrush(timelineData);
        initPlayer();

    }
    
    function initGraph(timelineData) {
        var bisectDate = d3.bisector(function (d) {
            return d.name;
        }).left;


        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        var valueline = d3.line()
            .x(function (d) {
                return x(d.name);
            })
            .y(function (d) {
                return y(d.value);
            });

        //Add TimeGraph to graphsvg
        svg2 = d3.select("#graph")
            .append("svg")
            .attr("class", "timeGraph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," +
                margin.top + ")");

        x.domain(d3.extent(timelineData, function (d) {
            return d.name;
        }));
        y.domain([0, d3.max(timelineData, function (d) {
            return d.value;
        })]);

        svg2.append("path")
            .data([timelineData])
            .attr("class", "line")
            .attr("d", valueline);
    }

    function initBrush(timelineData) {
        //Adding brush --extent defines area, -5 to cover whole graph
        //http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
        brushScale = d3.scaleLinear().domain([0, width]).range([1791, 2016]);

        brushTime = d3.brushX()
            .extent([[0, -5], [width, height]])
            .on("brush", brushed);

        //transform brush to graph-area and not svg-area
        d3.select(".timeGraph")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "brush")
            .call(brushTime)
            .call(brushTime.move, x.range());

        // Area of the graph under line
        var area = d3.area()
            .x(function (d) {
                return x(d.name);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.value);
            });

        svg2.append("path")
            .datum(timelineData)
            .attr("class", "area")
            .attr("d", area);
        
        //Graphfläche
        svg2.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
    }

    function brushed() {
        var selection = d3.event.selection;
        console.log(selection);
        let date = [parseInt(brushScale(selection[0])), parseInt(brushScale(selection[1]))];
        //callback für main
        yearSelected(date);
    }

    //Test play pause
    function initPlayer() {
         var icon = $('.play');
            icon.click(function () {
                icon.toggleClass('active');
                tooglePlayback();
                return false;
            });
    }

    function nextPlaybackSet() {
        let handleW = d3.select(".handle--w");
        let handleE = d3.select(".handle--e");
        
        let date=getYear();
        if(date[1]>=2016){
           tooglePlayback();
        }
        //next Year Addition
        let nextDate = date[1]+1
        console.log("new year: "+ nextDate);
        //move right end update selection
        let brushend = brushScale.invert(nextDate);
        let brushstart = brushScale.invert(date[0]);
        
        console.log("new end");//998.91
        console.log(width);
        console.log(parseFloat(brushend)-parseFloat(handleE.attr("width"))/2);
        let brush=d3.select(".selection");
        handleE.attr("x",parseFloat(brushend)-parseFloat(handleE.attr("width"))/2);
        
        d3.select(".selection").attr("x",brushstart);
        d3.select(".selection").attr("width",brushend-brushstart);//ausrechnen
        yearSelected([date[0],date[1]]);
    }

    function tooglePlayback() {
        if (!played) {
            played = true;
            playbackIntervall = setInterval(nextPlaybackSet, 1500);
        } else {
            played = false;
            clearInterval(playbackIntervall);
        }
    }

    function getYear() {
        var selection = [];
        let handle = d3.selectAll(".handle");
        handle.each(function (d) {
            selection.push(parseFloat(d3.select(this).attr("x"))+parseFloat(d3.select(this).attr("width"))/2);
        })
        selection.sort();
        let date = [parseInt(brushScale(selection[0])), parseInt(brushScale(selection[1]))];
        console.log(date);
        return date;
    }

    that.getYear = getYear;
    that.drawTimeGraph = drawTimeGraph;
    return that;
};