/* eslint-env browser  */

var d3 = d3 || {};
d3.map = function (data) {
    "use strict";

    var that = {};

    function displaymap(data){
        console.log(data);
    }
// http://bl.ocks.org/rveciana/a2a1c21ca1c71cd3ec116cc911e5fce9
    function initMap() {
        console.log("init Map");
        //svg in index erstellen lassen!
        var width = 960,
            height = 600;

        
        //test coordinates
        var projection = d3.geoAlbersUsa().translate([width/2, height/2])
				   .scale(1300);
        var path = d3.geoPath()
            .projection(projection);
        
        //var path = d3.geoPath()
        var svg = d3.select("#map")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .attr("id", "mapsvg")
        
        //var states=data.getMapDrawData(displaymap);
        //console.log(states);
        //loads the jsonlist with ids und Statenames
        d3.tsv("data/us-state-names.tsv", function (statenames) {
            //loads the jsonlist with states and their contour
            //ohne internet!!
            //https://gist.github.com/shawnbot/e6a857780ec2fe6002f7
            d3.json("data/us-state.json", function (error, json) {
                //console.log(json);
                var states=topojson.feature(json, json.objects.states).features
                if (error) throw error;
                //appends the contours to the svg
                //console.log(json);
                svg.append("g")
                    .attr("class", "states")
                    .selectAll("path")
                    .data(states)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    //mit css klasse machen?
                    .classed("clearState", true)
                    //join via id the statecode 
                    .attr("id",function (state) {
                        var statename;
                        for (var i = 0; i < statenames.length; i++) {
                            if (statenames[i].id == state.id) {
                                statename = statenames[i].code;
                            }
                        }
                        return statename;
                    })
                    

                //map is ready
                onMapReady();
                testCoordinates(svg,projection);
            });
        });

    }
    
    function onMapReady() {
        console.log("map is ready");
        //timeline jetzt aktivieren?!
        ChoroplethColor("1790");
        //testCoordinates();
        
    }

    //removes the color for every state
    function clearMapColor() {
        let states = document.querySelectorAll("map>path");
        states.forEach(function (state) {
            state.removeAttribute("style");
            state.classList.add("clearState");
        });
    }

    //transformes data from Object to array(Objects) calculates the color and colors the states
    function ChoroplethColor(curyear) {
        var transform = data.getMapData(curyear);
        clearMapColor();


        //http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };

        d3.selection.prototype.moveToBack = function () {
            return this.each(function () {
                var firstChild = this.parentNode.firstChild;
                if (firstChild) {
                    this.parentNode.insertBefore(this, firstChild);
                }
            });
        };

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
                //console.log(stateEl);
                stateEl.style("fill", state.color)
                    .on("mouseover", function () {
                        return tooltip.style("visibility", "visible");
                    }).on("mousemove", function () {
                        return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                    }).on("mouseout", function () {
                        return tooltip.style("visibility", "hidden").text(state.name);
                    }).on("click", function (event) {
                        if(!stateEl.classed("selectedState")){
                        stateEl.classed("selectedState", true);
                        stateEl.moveToFront();
                        }else{
                        stateEl.classed("selectedState", false);
                        stateEl.moveToBack();    
                        }

                        //Testlog
                        returnSelectedStates();
                    });

            } else {
                console.log("unknown SateName: " + key);
            }
        });
    }

    function returnSelectedStates() {
        console.log($(".map>.selectedState"));
        var selectedStates = $(".selectedState").map(function () {
            return $(this).attr("id");
        }).toArray();
        return selectedStates;
    }
    
    function testCoordinates(svg,projection){
        var loc=[-87.6356208,41.5022297];
        console.log("test data!");
        svg.selectAll("circle")
		.data(loc).enter()
		.append("circle")
		.attr("cx", function (d) { return projection(loc)[0]; })
		.attr("cy", function (d) { return projection(loc)[1]; })
		.attr("r", "8px")
		.attr("fill", "red")
    }
    
    that.returnSelectedStates = returnSelectedStates;
    that.ChoroplethColor = ChoroplethColor;
    that.initMap = initMap;
    return that;
};