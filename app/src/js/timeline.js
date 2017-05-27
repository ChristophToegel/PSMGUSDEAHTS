/* eslint-env browser  */

var d3 = d3 || {};
d3.timeline = function (displaymap, data) {
    "use strict";

    var that = {},
        transform;

    function initTimeline() {
        console.log("init Timeline");
        drawTimeGraph();
    }


    function drawTimeGraph() {
        /*var sumDeaths = {};
        d3.csv("data/clean_data.csv", function (csv) {
            csv.forEach(function (i) {
                sumDeaths[i.year] = (sumDeaths[i.year] || 0) + 1;

            });
            var transform = [];
            for (var year in sumDeaths) {
                var year = {
                    name: year,
                    value: sumDeaths[year]
                };
                transform.push(year);
            }
        */
        transform = data.getdataTimeline();
        //console.log(data.getdataTimeline());
        var bisectDate = d3.bisector(function (d) {
            return d.name;
        }).left;

        var margin = {
                top: 30,
                right: 40,
                bottom: 30,
                left: 100
            },
            width = 1300 - margin.left - margin.right,
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

        x.domain(d3.extent(transform, function (d) {
            return d.name;
        }));
        y.domain([0, d3.max(transform, function (d) {
            return d.value;
        })]);

        svg2.append("path")
            .data([transform])
            .attr("class", "line")
            .attr("d", valueline);


        // Add the X Axis
        svg2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        //svg.append("g")
        //  .call(d3.axisLeft(y));


        //Adding brush --extent defines area, -5 to cover whole graph
        //http://bl.ocks.org/rajvansia/ce6903fad978d20773c41ee34bf6735c
        var brushScale = d3.scaleLinear().domain([0,width]).range([1792,2016]);
        
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
            let date = [parseInt(brushScale(selection[0])),parseInt(brushScale(selection[1]))];
            updateDateInfo(date);
                

        }


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
            .datum(transform)
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
                d0 = transform[i - 1],
                d1 = transform[i],
                d = x0 - d0.name > d1.name - x0 ? d1 : d0;
            //d.name=year

            var area2 = d3.area()
                .x(function (d) {
                    return x(d.name);
                })
                .y0(height)
                .y1(function (d) {
                    return y(d.value);
                });

            d3.select(".area2").remove();
            //slection marker wieder aktiviere
            /*svg2.append("path")
                .datum(transform.slice(0, i))
                .attr("class", "area2")
                .attr("d", area2);

            */
            displaymap(d.name);
            updateDateInfo(d.name);
    
        }


        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(transform, x0, 1),
                d0 = transform[i - 1],
                d1 = transform[i],
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

        $yearInfoEl1.fadeOut(0, function () {
            $(this).text(date[0]).fadeIn(0);
        })
        
        $yearInfoEl2.fadeOut(0, function () {
            $(this).text(date[1]).fadeIn(0);
        })
    }

    that.initTimeline = initTimeline;
    return that;
};