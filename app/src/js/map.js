/* eslint-env browser  */

var d3 = d3 || {};
d3.map = function (data) {
    "use strict";

    var that = {};

    function initMap() {
        console.log("init Map");
        //svg in index erstellen lassen!
        var width = 600,
            height = 600;

        var svg = d3.select("#map")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .attr("id", "mapsvg")

        var path = d3.geoPath()

        //loads the jsonlist with ids und Statenames
        d3.tsv("data/us-state-names.tsv", function (statenames) {
            //loads the jsonlist with states and their contour
            //d3.json("https://d3js.org/us-10m.v1.json", function (error, json) {
            //ohne internet!!
            d3.json("data/us-state1.json", function (error, json) {
                if (error) throw error;
                //appends the contours to the svg
                svg.append("g")
                    .attr("class", "states")
                    .selectAll("path")
                    .data(topojson.feature(json, json.objects.states).features)
                    .enter().append("path")
                    .attr("d", path)
                    //mit css klasse machen?
                    .classed("clearState", true)
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
    function ChoroplethColor(curyear) {
        var transform = data.getMapData(curyear);
        clearMapColor();

        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")

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
            //console.log(color(state.value));
            var selector = "#" + state.name;
            selector = selector.replace(" ", "");
            var stateEl = d3.select(selector);
            if (stateEl != null) {
                //console.log(stateEl)
                stateEl.style("fill", state.color)
                    .on("mouseover", function () {
                        return tooltip.style("visibility", "visible");
                    }).on("mousemove", function () {
                        return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                    }).on("mouseout", function () {
                        return tooltip.style("visibility", "hidden").text(state.name);
                    }).on("click", function (event) {
                        console.log(state);
                        stateEl.classed("selectedState", !stateEl.classed("selectedState"));
                });

            } else {
                console.log("unknown SateName: " + key);
            }
        });
    }
    
    function returnSelectedStates(){
        var selectedStates = document.querySelector(".map>.SelectedState").map()
        return 
    }

    that.ChoroplethColor = ChoroplethColor;
    that.initMap = initMap;
    return that;
};