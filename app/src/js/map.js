/* eslint-env browser  */

var Index = Index || {};
Index.map = function (mapisready, stateSelected) {
    "use strict";

    const width = 1060,
        height = 700;
    var that = {},
        path, svg, projection, zoom, g, selectedState;

    // zoom: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
    function initMap() {
        console.log("init Map");

        //svg in index erstellen lassen!
        //enable map zoom
        zoom = d3.zoom()
            .scaleExtent([1, 1000])
            .on("zoom", zoomed);

        //set projection for mapping coordinates
        projection = d3.geoAlbersUsa().translate([(width / 2), height / 2])
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
        g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
        g.attr("transform", d3.event.transform);
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
                return i.statename
            })
            .on("click", clickedState)
        //callback für main wenn map fertig gezeichnet(-->Dateneintragen möglich)
        mapisready();
    }



    function clickedState(event) {
        //TODO Coordinates not clickable 
        if (selectedState != event.statename) {
            zoomIn(event);
            //callback für main 1 staat ausgewählt
            stateSelected(event.statename);
            selectedState = event.statename;
            markState(event.statename);
        } else {
            zoomOut();
            let state = document.getElementById(event.statename);
            state.classList.remove("selectedState")
            //callback für main kein staat ausgewählt
            stateSelected();
            //nicht schön!
            selectedState = " ";
        }
    }

    //http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    function markState(name) {
        var el = d3.select("#" + name);
        el._groups[0][0].classList.add("selectedState");
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
    }

    function zoomOut() {
        document.querySelector("#rightContent p").classList.add("hidden");
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
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
        clearMapColor();
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
        data.forEach(function (state) {
            state.color = color(state.value);
            //console.log(color(state.value));
            var selector = "#" + state.name;
            selector = selector.replace(" ", "");
            var stateEl = d3.select(selector);
            if (stateEl != null) {
                stateEl.style("fill", state.color)
            } else {
                console.log("unknown SateName: " + key);
            }
        });
    }

    function createtooltip() {
        return d3.select("#content").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    //Callback for points
    function pointsready(data) {
        //test div tooltip
        console.log(data);
        var tooltip = createtooltip();
        //console.log(data);
        //test dif color for value
        var color = d3.scaleQuantile().range(['rgb(0, 250, 0)','rgb(0, 200, 0)','rgb(0, 150, 0)','rgb(0, 100, 0)','rgb(0, 0, 0)']);
        //.range(["rgb(0, 0, 204)", "rgb(0, 204, 0)", "rgb(204, 0, 0)","rgb(0,0,0)"]);
        color.domain([
                d3.min(data, function (d) {
                return d.value.length;
            }),
                d3.max(data, function (d) {
                return d.value.length;
            })
        ]);
        //viele 0-10 wenige über 100!
        var max = d3.max(data, function (d) {
            return d.value.length;
        });
        console.log(max);
        //points ready to draw
        svg.selectAll(".places").remove();
        svg.append("g")
            .attr("class", "places")
            //.attr("class", "notclickabel") points remove funktionerte dann nicht 
            .selectAll("circle")
            .data(data).enter()
            .append("circle")
            .attr("cx", function (d) {
                //console.log(d);
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
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.name + " <br/>" + "Anzahl der Todesfälle: " + d.value.length)
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY - 172 + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            //TODO tooltip löschen
            })
            .on("click", pointClicked);
    }

    function pointClicked(data) {
        var text = data.name;
        for (var i = 0; i < data.value.length; i++) {
            text = text + "<br/> Name: " + data.value[i].person + "Datum: " + data.value[i].eow + " Cause: " + data.value[i].cause_short
        }
        let element = document.querySelector("#rightContent p");
        element.innerHTML = text;
        element.classList.remove("hidden");
    }

    that.pointsready = pointsready;
    that.mapdatareceived = mapdatareceived;
    that.ChoroplethColor = ChoroplethColor;
    that.initMap = initMap;
    return that;
};
