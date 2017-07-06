/* eslint-env browser  */

var Index = Index || {};
Index.timeline = function (yearSelected) {
    //TODO: data in main und data.getdataTimeline() übergeben
    "use strict";

    var that = {};

    function drawTimeGraph(timelineData) {
        console.log("init Timeline");
        var bisectDate = d3.bisector(function (d) {
            return d.name;
        }).left;

        var margin = {
                top: 30,
                right: 40,
                bottom: 30,
                left: 30
            },
            width = $("#map").width()-margin.left-margin.right,
            height = 210 - margin.top - margin.bottom;


        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        var valueline = d3.line()
            .x(function (d) {
                return x(d.name);
            })
            .y(function (d) {
                return y(d.value);
            });

        //Add TimeGraph to graphsvg
        var svg2 = d3.select("#graph")
            .append("svg")
            .attr("class", "timeGraph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(timelineData, function (d) {
            return d.name;
        }));
        y.domain([ d3.max(timelineData, function (d) {
            return d.value;
        }),0]);

        svg2.append("path")
            .data([timelineData])
            .attr("class", "line")
            .attr("d", valueline);


        // Add the X Axis
       /* svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)); */

        // Add the Y Axis
        //svg.append("g")
        //  .call(d3.axisLeft(y));


        //Adding brush --extent defines area, -5 to cover whole graph
        //http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
        var brushScale = d3.scaleLinear().domain([0, width]).range([1792, 2016]);

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


        function brushed() {
            var selection = d3.event.selection;
            let date = [parseInt(brushScale(selection[0])), parseInt(brushScale(selection[1]))];
            updateDateInfo(date);

            //callback für main
            yearSelected(date);


        }


        // Area of the graph under line
        var area = d3.area()
            .x(function (d) {
                return x(d.name);
            })
            .y0(0)
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

*/          //never called?
            //yearSelected(d.name);
            updateDateInfo(d.name);

        }

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

        //});
    }

    function updateDateInfo(date) {
        let $yearInfoEl1 = $("#yearSel1");
        let $yearInfoEl2 = $("#yearSel2");

        // Test für passende Schriftart 
        /*
        if (date < 1849) {
            $yearInfoEl.css("font-family", "'Fredericka the Great', cursive");
        } else if (date < 1889) {
            $yearInfoEl.css("font-family", "Calligraffitti, cursive");
        } else if (date < 1989) {
            $yearInfoEl.css("font-family", "Space Mono, monospace");
            //$yearInfoEl.setAttribute("font-size-adjust",0.5);
        } else {
            $yearInfoEl.css("font-family", "Abel, sans-serif");
            //$yearInfoEl.setAttribute("font-size-adjust",0.5);

        }
        */

        var yearSel1 = document.getElementById('yearSel1');
        var yearSel2 = document.getElementById('yearSel2');


        window.odometerOptions = {
            auto: false, // Don't automatically initialize everything with class 'odometer'
            format: 'd', // Change how digit groups are formatted, and how many digits are shown after the decimal point
        };

        var od1 = new Odometer({
            el: yearSel1,
            format: 'd',
            theme: 'minimal'
        });

        var od2 = new Odometer({
            el: yearSel2,
            format: 'd',
            theme: 'minimal'
        });

        od1.update(date[0]);
        od2.update(date[1]);

    }
    
  
    that.drawTimeGraph = drawTimeGraph;
    return that;
};