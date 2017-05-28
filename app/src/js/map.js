/* eslint-env browser  */

var Index = Index || {};
Index.map = function (mapisready, stateSelected) {
    "use strict";

    var that = {},
        path, svg, projection;

    // http://bl.ocks.org/rveciana/a2a1c21ca1c71cd3ec116cc911e5fce9
    function initMap() {
        console.log("init Map");
        //svg in index erstellen lassen!
        var width = 960,
            height = 600;


        //set projection for mapping coordinates
        projection = d3.geoAlbersUsa().translate([width / 2, height / 2])
            .scale(1300);
        path = d3.geoPath()
            .projection(projection);

        svg = d3.select("#map")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .attr("id", "mapsvg")
    }
    

    function mapdatareceived(states) {
        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(states)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("clearState", true)
            .attr("id", function (i) {
                return i.statename
            })
        console.log("map is ready");
        mapisready();
        //callback für main
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
    function ChoroplethColor(data) {
        //drwas the points
        //TODO muss über main modul gemacht werden!!!
        //data.getMapPointData(pointsready, curyear);
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
                d3.min(data, function (d) {
                return d.value;
            }),
                d3.max(data, function (d) {
                return d.value;
            })
    ]);
        //liste aller zZ ausgewählten Staaten
        //TODO soll auch für Staaten funktionieren, welche keine toten haben!!
        var selectedStates = [];
        data.forEach(function (state) {
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
                        if (!stateEl.classed("selectedState")) {
                            stateEl.classed("selectedState", true);
                            stateEl.moveToFront();
                            //TODO test if selection works
                            selectedStates.push(stateEl["_groups"][0][0].id);
                            
                        } else {
                            //TODO test if remove works
                            selectedStates = removeState(stateEl["_groups"][0][0].id, selectedStates);
                            
                            stateEl.classed("selectedState", false);
                            stateEl.moveToBack();
                        }

                        //callback for main.js
                        stateSelected(selectedStates);
                    });

            } else {
                console.log("unknown SateName: " + key);
            }
        });
    }

    function removeState(state, stateslist) {
        var newList = [];
        for (var i = 0; i < stateslist.length; i++) {
            if (stateslist[i] !== state) newList.push(stateslist[i]);
        }
        return newList;

    }

    function returnSelectedStates() {
        console.log($(".map>.selectedState"));
        var selectedStates = $(".selectedState").map(function () {
            return $(this).attr("id");
        }).toArray();
        return selectedStates;
    }

    //Callback for points
    function pointsready(data) {
        console.log(data);
        //points ready to draw
        svg.selectAll(".places").remove();
        svg.append("g")
            .attr("class", "places")
            .selectAll("circle")
            .data(data).enter()
            .append("circle")
            .attr("cx", function (d) {
                if (projection([d.lng, d.lat]) != null) {
                    return projection([d.lng, d.lat])[0];
                } else {
                    return 0;
                }
            })
            .attr("cy", function (d) {
                if (projection([d.lng, d.lat]) != null) {
                    return projection([d.lng, d.lat])[1];
                } else { //console.log("liegt nicht auf karte oder noch keine geodaten verfügber!");console.log(d);
                    return 0;
                }
            })
            .attr("r", "2px")
            .attr("fill", "green")
    }
    
    that.pointsready=pointsready;
    that.mapdatareceived=mapdatareceived;
    that.returnSelectedStates = returnSelectedStates;
    that.ChoroplethColor = ChoroplethColor;
    that.initMap = initMap;
    return that;
};
