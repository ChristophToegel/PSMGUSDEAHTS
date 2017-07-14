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
        width = $("#map").width() - margin.left - margin.right - 100,
        height = 80 - margin.top - margin.bottom,
        brushScale, x, y, svg2;

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


        // Add the X Axis
        svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        /*svg.append("g")
          .call(d3.axisLeft(y)); */
    }

    function initBrush(timelineData) {
        //Adding brush --extent defines area, -5 to cover whole graph
        //http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
        brushScale = d3.scaleLinear().domain([0, width]).range([1792, 2016]);

        var brush = d3.brushX()
            .extent([[0, -5], [width, height]])
            .on("brush", brushed);
        //transform brush to graph-area and not svg-area
        d3.select(".timeGraph")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());


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

        //Marker wieder aktivieren
        /* var focus = svg2.append("g")
             .attr("class", "focus")
             .style("display", "none");

         focus.append("line")
             .attr("y1", 0)
             .attr("y2", height)


         focus.append("text")
             .attr("x", 9)
             .attr("dy", ".35em");

         */
        //Graphfläche
        svg2.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
    }

    //alt anzeige des aktuell ausgewählten
    //Vllt umbauen
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(timelineData, x0, 1),
            d0 = timelineData[i - 1],
            d1 = timelineData[i],
            d = x0 - d0.name > d1.name - x0 ? d1 : d0;
        //console.log("x0 " + x0 + "; i " + i + "; d0 " + d0 + "; d1 " + d1 + "; d " + d);
        //focus.attr("transform", "translate(" + x(d.name) + "," + y(d.value) + ")");
        focus.attr("x1", x0).attr("x2", x0);
        focus.attr("transform", "translate(" + x(d.name) + "," + "0" + ")");
        focus.select("text").text((d.name)).attr("transform", "translate(0,-10)");
    }

    function brushed() {
        var selection = d3.event.selection;
        let date = [parseInt(brushScale(selection[0])), parseInt(brushScale(selection[1]))];
        //callback für main
        yearSelected(date);
    }


    function drawTimeGraph(timelineData) {
        console.log("init Timeline");

        initGraph(timelineData);
        initBrush(timelineData);

        /*
        //Tastaturkontrolle über Brush
        brush("#brushTime").addEventListener("keydown", function(){
            var selection = d3.event.selection;
            switch (event.key){
                case "ArrowLeft":
                    console.log("Links")
                    brush.extent = [[brushScale(selection[0]-1),height], [brushScale(selection[1]),height]];
                    break;
                    
                case "ArrowRight":
                    console.log("Rechts")
                    brush.extent = [[brushScale(selection[0]+1),height], [brushScale(selection[1]),height]];
                    break;
                    
                case "ArrowUp":
                    console.log("Hoch")
                    brush.extent = [[brushScale(selection[0]),height], [brushScale(selection[1]+1),height]];
                    break;
                    
                case "ArrowDown":
                    console.log("Runter")
                    brush.extent = [[brushScale(selection[0]),height], [brushScale(selection[1]-1),height]];
                    break;
                    
                default:
                    return;  
            }
        })
        
        
        // Optische Erscheinung des Brush
        var handle = brush.selectAll(".handle--custom")
            .data([{
                type: "w"
            }, {
                type: "e"
            }])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5)
            .attr("cursor", "ew-resize")
            .attr("d", d3.arc()
                .innerRadius(0)
                .outerRadius(height / 2)
                .startAngle(0)
                .endAngle(function (d, i) {
                    return i ? Math.PI : -Math.PI;
                }));
            */

        /*.on("mouseover", function () {
            focus.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
        })
            
        //Marker wieder aktivieren
        //.on("mousemove", mousemove)
        //.on("click", mouseclick);
        */


        /* ALT 
        function mouseclick() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(transform, x0, 1),
                d0 = timelineData[i - 1],
                d1 = timelineData[i],
                d = x0 - d0.name > d1.name - x0 ? d1 : d0;
            //d.name=year 
            
            
            //slection marker wieder aktiviere
            /*svg2.append("path")
                .datum(transform.slice(0, i))
                .attr("class", "area2")
                .attr("d", area2);
                //never called?
            //yearSelected(d.name);
        }
        */

        //});
    }


    function getYear() {
        var selection = [];
        let handle = d3.selectAll(".handle");
        handle.each(function (d) {
            selection.push(d3.select(this).attr("x"));
        })
        selection.sort();
        let date = [parseInt(brushScale(selection[0]) + 1), parseInt(brushScale(selection[1]) + 1)];
        return date;
    }

    that.getYear = getYear;
    that.drawTimeGraph = drawTimeGraph;
    return that;
};
