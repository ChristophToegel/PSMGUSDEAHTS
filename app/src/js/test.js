// based on: https://bost.ocks.org/mike/bar/
var d3 = d3 || {};

//intializes the map and draws it without data
//adds the id for the states

drawTimeGraph();

function initmap() {
    var width = 600,
        height = 600;

    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("id", "mapsvg")

    var path = d3.geoPath()

    //loads the jsonlist with ids und Statenames
    d3.tsv("us-state-names.tsv", function (statenames) {
        //loads the jsonlist with states and their contour
        d3.json("https://d3js.org/us-10m.v1.json", function (error, json) {
            if (error) throw error;
            //appends the contours to the svg
            svg.append("g")
                .attr("class", "states")
                .selectAll("path")
                .data(topojson.feature(json, json.objects.states).features)
                .enter().append("path")
                .attr("d", path)
                .style("fill", "#f0f0f5")
                .style("stroke", "#000")
                .style("stroke-width", "1")
                //join via id the statecode 
                .attr("id", function (state) {
                    var statename;
                    for (var i = 0; i < statenames.length; i++) {
                        if (statenames[i].id === state.id) {
                            statename = statenames[i].code;
                        }
                    }
                    return statename;
                });
            //map is ready
            onMapReady();
        });
    });

}

function onMapReady() {
    console.log("map is ready");
    //timeline jetzt aktivieren?!

    //https://timeline.knightlab.com
    //https://github.com/jiahuang/d3-timeline

}

// ondrag preview year!
var timeline;

function timechanged(stop) {
    slider = document.querySelector("#timeslider");
    slider.value++;
    if (stop) {
        slider.value--;
        stopTime();
    }
    //console.log("year chanched: "+slider.value);
    document.querySelector("#year").innerHTML = slider.value;
    testDataSelection(slider.value);
}

function stopTime() {
    clearInterval(timeline);
    console.log("stop time");
}

function startTime() {
    console.log("start time");
    timeline = setInterval(timechanged, 1000);
}

function drawTimeGraph() {
    var sumDeaths = {};
    d3.csv("clean_data.csv", function (csv) {
        csv.forEach(function (i) {
            sumDeaths[i.year] = (sumDeaths[i.year] || 0) + 1;

        });
        transform = [];
        for (var year in sumDeaths) {
            var year = {
                name: year,
                value: sumDeaths[year]
            };
            transform.push(year);
        }

        var bisectDate = d3.bisector(function (d) {
            return d.name;
        }).left;

        var margin = {
                top: 30,
                right: 40,
                bottom: 30,
                left: 100
            },
            width = 1500 - margin.left - margin.right,
            height = 270 - margin.top - margin.bottom;

        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        var valueline = d3.line()
            .x(function (d) {
                return x(d.name);
            })
            .y(function (d) {
                return y(d.value);
            });

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


        var area = d3.area()
            .x(function (d) {
                return x(d.name);
                console.log(d.name);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.value);
            });


        svg2.append("path")
            .datum(transform)
            .attr("class", "area")
            .attr("d", area);

        //Marker
        var focus = svg2.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("line")
            .attr("y1", 0)
            .attr("y2", height)


        focus.append("text")
            .attr("x", 9)
            .attr("dy", ".35em");


        //Graphfläche
        svg2.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function () {
                focus.style("display", null);
            })
            .on("mouseout", function () {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove)
            .on("click", mouseclick);



        function mouseclick() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(transform, x0, 1),
                d0 = transform[i - 1],
                d1 = transform[i],
                d = x0 - d0.name > d1.name - x0 ? d1 : d0,
                slider = document.querySelector("#timeslider");

            console.log(d.name);
            slider.value = d.name;
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

    });
}


//Selects the proper Data from csv and Counts the Deaths for every stats(stored via Object)
//http://stackoverflow.com/questions/10615290/select-data-from-a-csv-before-loading-it-with-javascript-d3-library
function testDataSelection(curyear) {
    console.log(curyear);
    var sumStates = {};

    d3.csv("clean_data.csv", function (csv) {
        csv = csv.filter(function (row) {
                return row['year'] <= curyear;
            })
            //console.log("data ready");
            //console.log(csv);
        csv.forEach(function (i) {
            sumStates[i.state] = (sumStates[i.state] || 0) + 1;
        });
        //{ NY: 4,  US: 3,  SC: 1,  NC: 1,  KY: 1, …}
        testChoroplethColor(sumStates);

    });
}

//removes the color for every state
function clearMapColor() {
    let states = document.querySelectorAll("path");
    states.forEach(function (state) {
        state.removeAttribute("style");
        state.classList.add("clearState");
    });
}

//transformes data from Object to array(Objects) calculates the color and colors the states
function testChoroplethColor(data) {
    clearMapColor();

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")



    transform = [];
    for (var key in data) {
        var state = {
            name: key,
            value: data[key]
        };
        transform.push(state);
    }
    var color = d3.scaleQuantile()
        .range(["rgb(255, 230, 230)", "rgb(255, 204, 204)", "rgb(255, 179, 179)", "rgb(255, 153, 153)", "rgb(255, 128, 128)", "rgb(255, 102, 102)",
                     "rgb(255, 77, 77)", "rgb(255, 51, 51)", "rgb(255, 26, 26)"]);

    color.domain([
                d3.min(transform, function (d) {
            return d.value;
        }),
                d3.max(transform, function (d) {
            return d.value;
        })
    ]);

    transform.forEach(function (state) {
        state.color = color(state.value);
        console.log(color(state.value));
        var selector = "#" + state.name;
        selector = selector.replace(" ", "");
        var stateEl = d3.select(selector);
        if (stateEl != null) {
            console.log(stateEl)
            stateEl.style("fill", state.color).on("mouseover", function () {
                return tooltip.style("visibility", "visible");
            }).on("mousemove", function () {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            }).on("mouseout", function () {
                return tooltip.style("visibility", "hidden").text(state.name);
            });
        } else {
            console.log("unknown SateName: " + key);
        }
    });
    console.log(transform);
    
    //piechart
    <script>
        (function (d3) {
            'use strict';
            var dataset = [
                {
                    label: 'Accidents',
                    count: 40
                },
                {
                    label: 'Natural causes',
                    count: 20
                },
                {
                    label: 'Suspect Known',
                    count: 15
                },
                {
                    label: 'Illness',
                    count: 20
                },
                {
                    label: 'Other causes',
                    count: 5
                }
        ];
            var width = 240;
            var height = 270;
            var radius = Math.min(width, height) / 2;
            var color = d3.scaleOrdinal()
                .range(["rgb(255, 77, 77)", "rgb(255, 102, 102)", "rgb(255, 128, 128)", "rgb(255, 153, 153)", "rgb(255, 179, 179)", "rgb(255, 204, 204)", "rgb(255, 230, 230)"]);
            var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + (width / 2) +
                    ',' + (height / 2) + ')');
            var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);
            var pie = d3.pie()
                .value(function (d) {
                    return d.count;
                })
                .sort(null);
            var path = svg.selectAll('path')
                .data(pie(dataset))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function (d) {
                    return color(d.data.label);
                });
        })(window.d3);
    </script>

}
initmap();