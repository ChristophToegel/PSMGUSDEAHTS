/* eslint-env browser  */
/* global d3  */

// points: https://stackoverflow.com/questions/29624745/d3-insert-vs-append-in-context-of-creating-nodes-on-mousemove
// zoom: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
var Index = Index || {};
Index.map = function (mapisready, stateSelected, pointClicked,stateHover) {
    "use strict";

    var that = {},
        path, svg, projection, g, selectedState, zoom, transformation,
        margin = {
            top: 20,
            right: 0,
            bottom: 20,
            left: 0
        };
    const width = $("#map").width() - margin.left - margin.right - 35,
        height = 0.6 * width;

    function initMap() {
        
        zoom = d3.zoom()
            .scaleExtent([1, 1000])
            .on("zoom", zoomed);

        //set projection for mapping coordinates
        projection = d3.geoAlbersUsa()
            .translate([(width / 2), height / 2])
            .scale(1300);

        path = d3.geoPath()
            .projection(projection);

        svg = d3.select("#map")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .attr("id", "mapsvg")

    }

    //zooming
    function zoomed() {
        svg.selectAll("circle").attr("transform", d3.event.transform);
        svg.selectAll("rect").attr("transform", d3.event.transform);
        g.attr("transform", d3.event.transform);
        transformation = d3.event.transform;
    }

    //draws the map
    function mapdatareceived(states) {
        g = svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(states)
            .enter()
            .append("path")
            .attr("d", path)
            .classed("clearState", true)
            .attr("id", function (i) {
                return i.statenameshort
            })
            .on("click", clickedState)
            //callback für main wenn map fertig gezeichnet(-->Dateneintragen möglich)
        mapisready();
    }

    function clickedState(event) {
        if (selectedState != event.statenameshort) {
            zoomIn(event);
            //callback
            stateSelected(event.statenameshort);
            selectedState = event.statenameshort;
            let state = d3.select(this);
            let prevSelected = $(".selectedState");
            prevSelected.removeClass("selectedState");
            state.classed("selectedState", true);
            markState(state);
        } else {
            zoomOut();
            let state = d3.select("#" + event.statenameshort);
            state.classed("selectedState", false);
            //callback
            stateSelected();
            selectedState = undefined;
        }
    }

    //http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    function markState(el) {
        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };
        el.moveToFront()
    }

    function zoomIn(event) {
        var bounds = path.bounds(event),
            //breite und höhe des staates
            dy = bounds[1][0] - bounds[0][0],
            dx = bounds[1][1] - bounds[0][1],
            //mittelpunkt
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / height, dy / width))),
            translate = [(width / 2 - scale * x), height / 2 - scale * y];
        svg.transition().duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        svg.selectAll(".places").classed("notclickable", false)
        g.classed("zoomed", true);
    }

    function zoomOut() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
        svg.selectAll(".places").classed("notclickable", true)
        g.classed("zoomed", false);
    }

    //removes the color for every state
    function clearMapColor() {
        let states = document.querySelectorAll(".states>path");
        states.forEach(function (state) {
            state.removeAttribute("style");
            state.classList.add("clearState");
        });
    }

    //colors the map
    function ChoroplethColor(data) {
        clearMapColor();
        var color = d3.scaleQuantile()
            .range(["rgb(255, 223, 223)", "rgb(255, 172, 172)", "rgb(255, 122, 122)", "rgb(255, 78, 78)", "rgb(255, 32, 32)", ]);
        color.domain([
                d3.min(data, function (d) {
                return d.value;
            }),
                d3.max(data, function (d) {
                return d.value;
            })
        ]);
        
        createLegend(color.range(), color.quantiles())
        
        data.forEach(function (state) {
            state.color = color(state.value);
            var stateEl = d3.select("#" + state.name);
            if (stateEl != null) {
                stateEl.style("fill", state.color)
            } else {
                console.log("unknown SateName: " + key);
            }
            stateEl.on("mouseover", function (d) {
                    stateHover(d.statename)
                    let el = d3.select(this);
                    stateEl.classed("hoverState", true);
                    markState(el);
                })
                .on("mouseout", function (d) {
                    stateEl.classed("hoverState", false);
                })
        });
    }

    function createtooltip(data) {
        if (d3.select(".tooltip").empty()) {
            var tooltip = d3.select("#content").append("div").attr("class", "tooltip")
                .selectAll("div")
                .data([data]).enter().append("div")
        } else {
            var tooltip = d3.selectAll(".tooltip")
                .data([data])
        }
        return tooltip;
    }

    function createLegend(colors, values) {
        if (d3.select(".legende").empty()) {
            var legende = d3.selectAll("#map");
            legende = legende.append("svg")
                .attr("height", "20px")
                .attr("width", width)
                .append("g")
                .classed("legende", true)
                .attr('transform', 'translate(' + 250 + ',' + 19 + ')');
        } else {
            var legende = d3.selectAll(".legende");
            legende.selectAll("*").remove();
        }

        if (values[0] == undefined) {
            legende.append("text")
                .text("Please select categories or a timespan to display")
                .attr('transform', 'translate(' + 80 + ',' + -5 + ')')
                .style("fill", "#4e4e5e")
                .style("stroke-opacity", 0.1)
                .style("stroke", "black");
            return;
        }
        var entry = legende.selectAll("g")
            .data(colors).enter().append("g")
            .attr('transform', function (d, i) {
                return 'translate(' + 115 * i + ',0)'
            })
        entry.append('rect').attr('width', 12)
            .attr('stroke', "black")
            .attr('height', 12)
            .attr('fill', function (d) {
                return d;
            })
            .attr("y", "-12px")
        entry.append("text")
            .text(function (d, i) {
                if (i == 0) {
                    return "0 - " + Math.round(values[i]);
                } else if (i == values.length) {
                    return "> " + Math.round(values[i - 1]);
                } else {
                    return Math.round(values[i - 1]) + " - " + Math.round(values[i]);
                }

            })
            .attr("dy", "0px")
            .attr("dx", "18px")
            .style("fill", "#4e4e5e")
            .style("stroke-opacity", 0.1)
            .style("stroke", "black");
    }

    //Callback for points
    function pointsready(extreme,normal) {
        createNormalPoints(normal);
        createExtremePoints(extreme);
    }

    function createNormalPoints(normal) {
        //wenn noch keine points vorhanden sind elementstruktur erstellen
        if (d3.select("#normal").empty()) {
            var places = svg.append("g")
                .attr("class", "places")
                .attr("id", "normal")
                .classed("notclickable", true)
                .selectAll("circle")
                .data(normal).enter().
            insert("circle");
        } else {
            //Update
            var places = d3.select("#normal")
                .selectAll("circle")
                .data(normal)
        }
        addpointAttributes(places);
        //wenn weniger dann löschen
        places.exit().remove();
        //wenn mehr dann hinzufügen
        places = places.enter().
        insert("circle")
        //wenn zoom dann noch transformieren
        if (g.classed("zoomed")) {
            places.attr("transform", transformation);
        }
        addpointAttributes(places);
    }

    function createExtremePoints(extreme) {
        if (d3.select("#extreme").empty()) {
            var places = svg.append("g")
                .attr("class", "places")
                .attr("id", "extreme")
                .classed("notclickable", true)
                .selectAll("rect")
                .data(extreme).enter().
            insert("rect");
        } else {
            //Update
            var places = d3.select("#extreme")
                .selectAll("rect")
                .data(extreme)
        }

        addrectAttributes(places);
        //wenn weniger dann löschen
        places.exit().remove();
        //wenn mehr dann hinzufügen
        places = places.enter().
        insert("rect")
        //wenn zoom dann noch transformieren!
        if (g.classed("zoomed")) {
            places.attr("transform", transformation);
        }
        addrectAttributes(places);
    }

    function addrectAttributes(places) {
       places.attr("x", function (d) {
                if (projection([d.value[0].lng, d.value[0].lat]) != null) {
                    return projection([d.value[0].lng, d.value[0].lat])[0] - 10;
                } else {
                    return 0;
                }
            })
            .attr("y", function (d) {
                if (projection([d.value[0].lng, d.value[0].lat]) != null) {
                    return projection([d.value[0].lng, d.value[0].lat])[1] - 10;
                } else { 
                    //console.log("liegt nicht auf karte oder noch keine geodaten verfügber!");
                    return 0;
                }
            })
            .attr("width", "4px")
            .attr("height", "4px")
            .attr("fill", function (d) {
                return "rgb(0,0,0)";
            })
            mousefunctions(places);
        
    }
    
    function mousefunctions(place){
        place.on("mouseover", function (d) {
                var tooltip = createtooltip(d);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.name + " <br/>" + "Anzahl der Todesfälle: " + d.value.length)
                    .style("left", d3.event.layerX + 5 + "px")
                    .style("top", d3.event.layerY + 5 + "px");
            })
            .on("mouseout", function (d) {
                var tooltip = d3.selectAll(".tooltip");
                tooltip.classed("notclickable",true)
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", pointSelected);
    }

    function addpointAttributes(places) {
        places.attr("cx", function (d) {
                if (projection([d.value[0].lng, d.value[0].lat]) != null) {
                    return projection([d.value[0].lng, d.value[0].lat])[0];
                } else {
                    return 0;
                }
            })
            .attr("cy", function (d) {
                if (projection([d.value[0].lng, d.value[0].lat]) != null) {
                    return projection([d.value[0].lng, d.value[0].lat])[1];
                } else {
                    //console.log("liegt nicht auf karte oder noch keine geodaten verfügber!");
                    //console.log(d);
                    return 0;
                }
            })
            .attr("r", "2px")
            .attr("fill", function (d) {
                return "rgb(0,0,255)";
            })
            mousefunctions(places);
    }

    function pointSelected(event) {
        let prevPoint = d3.selectAll(".selectedPoint");
        prevPoint.classed("selectedPoint", false);
        let point = d3.select(this);
        point.classed("selectedPoint", true);
        //callback main
        pointClicked(event);
    }


    that.pointsready = pointsready;
    that.mapdatareceived = mapdatareceived;
    that.ChoroplethColor = ChoroplethColor;
    that.initMap = initMap;
    return that;
};