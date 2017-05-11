/* eslint-env browser  */

var d3 = d3 || {};
d3.map = function() {
  "use strict";

  var that ={};

  function initMap() {
    console.log("init Map");
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
}



  that.initMap = initMap;
  return that;
};