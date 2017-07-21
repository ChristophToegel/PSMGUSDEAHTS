/* eslint-env browser  */
/* global d3  */

// points: https://stackoverflow.com/questions/29624745/d3-insert-vs-append-in-context-of-creating-nodes-on-mousemove
// zoom: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
var Index = Index || {};
Index.map = function (mapisready, stateSelected, pointClicked) {
    "use strict";

    const width = 1000,
        height = 700;
    var that = {},
        path, svg, projection, g, selectedState, zoom, transformation;


    function initMap() {
        console.log("init Map");

        //svg in index erstellen lassen!
        //enable map zoom
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
        //verschiebt Coordinaten
        svg.selectAll("circle").attr("transform", d3.event.transform);
        //verschiebt map
        //g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
        g.attr("transform", d3.event.transform);
        transformation = d3.event.transform;
    }

    //zeichnet die Staaten
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
            //callback für main 1 staat ausgewählt
            stateSelected(event.statenameshort);
            selectedState = event.statenameshort;
            let state = d3.select(this);
            state.classed("selectedState", true);
            markState(state);

        } else {
            zoomOut();
            let state = d3.select("#" + event.statenameshort);
            state.classed("selectedState", false);
            //callback für main kein staat ausgewählt
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
        //Todo border soll mit zoom verknüpf sein/via css
        g.classed("zoomed", true);
        //Infobox nur bei zoom?
    }

    function zoomOut() {
        //Infobox nur bei zoom?
        //document.querySelector("#deathInfoBox").classList.add("hidden");
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

    //transformes data from Object to array(Objects) calculates the color and colors the states
    function ChoroplethColor(data) {
        clearMapColor();
        var color = d3.scaleQuantile()
            .range(["rgb(255, 223, 223)", "rgb(255, 183, 183)", "rgb(255, 132, 132)", "rgb(255, 82, 82)","rgb(255, 62, 62)",]);
        color.domain([
                d3.min(data, function (d) {
                return d.value;
            }),
                d3.max(data, function (d) {
                return d.value;
            })
        ]);

        createLegend(color.range(), color.quantiles())

        //liste aller zZ ausgewählten Staaten
        data.forEach(function (state) {
            state.color = color(state.value);
            var stateEl = d3.select("#" + state.name);
            if (stateEl != null) {
                stateEl.style("fill", state.color)
            } else {
                console.log("unknown SateName: " + key);
            }
            stateEl.on("mouseover", function (d) {
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
            .classed("legende",true)
            .attr('transform', 'translate(' + 250 + ',' + 15 + ')');
        } else {
            var legende = d3.selectAll(".legende");
            legende.selectAll("*").remove();
        }
        if (values[0] == undefined) {
            legende.append("text")
                .text("Keine Daten vorhanden. Bitte Filter auswählen!")
                .attr('transform', 'translate(' + 80 + ',' + 0 + ')')
                .style("fill", "#4e4e5e")
                .style("stroke-opacity", 0.1)
                .style("stroke", "black");
            return;
        }
        var entry = legende.selectAll("g")
            .data(colors).enter().append("g")
            .attr('transform', function (d, i) {
                return 'translate(' + 105 * i + ',0)'
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
    function pointsready(data) {
        //TODO color anpassen: https://bl.ocks.org/pstuffa/d5934843ee3a7d2cc8406de64e6e4ea5 ??
        var color = d3.scaleQuantize().range(["rgb(0, 0, 255)", "rgb(0, 0, 0)", "rgb(0, 255, 0", "rgb(255,255,255)"]);
        color.domain([
                d3.min(data, function (d) {
                return d.value.length;
            }),
                d3.max(data, function (d) {
                return d.value.length;
            })
        ]);

        //wenn noch keine points vorhanden sind elementstruktur erstellen
        if (d3.select(".places").empty()) {
            var places = svg.append("g")
                .attr("class", "places")
                .classed("notclickable", true)
                .selectAll("circle")
                .data(data).enter().insert("circle");

        } else {
            //Update
            var places = d3.select(".places")
                .selectAll("circle")
                .data(data)
        }

        addpointAttributes(places, color);
        //wenn weniger dann löschen
        places.exit().remove();
        //wenn mehr dann hinzufügen
        places = places.enter().insert("circle")
        //wenn zoom dann noch transformieren!
        if (g.classed("zoomed")) {
            places.attr("transform", transformation);
        }
        addpointAttributes(places, color);
    }

    function addpointAttributes(places, color) {
        places.attr("cx", function (d) {
                if (projection([d.value[0].lng, d.value[0].lat]) != null) {
                    return projection([d.value[0].lng, d.value[0].lat])[0];
                } else {
                    return 0;
                }
            })
            .attr("cy", function (d) {
                //console.log(d.value[0].lat);
                if (projection([d.value[0].lng, d.value[0].lat]) != null) {
                    return projection([d.value[0].lng, d.value[0].lat])[1];
                } else { //console.log("liegt nicht auf karte oder noch keine geodaten verfügber!");console.log(d);
                    return 0;
                }
            })
            .attr("r", "2px")
            .attr("fill", function (d) {
                return color(d.value.length);
            })
            .on("mouseover", function (d) {
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
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            //pointClick callback
            .on("click", pointClicked);
    }


    that.pointsready = pointsready;
    that.mapdatareceived = mapdatareceived;
    that.ChoroplethColor = ChoroplethColor;
    that.initMap = initMap;
    return that;
};
