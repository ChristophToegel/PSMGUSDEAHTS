/* eslint-env browser  */

var d3 = d3 || {};
d3.main = function () {
    "use strict";

    var that = {},
        map, data;

    function init() {
        console.log("init main");
        //daten einlesen
        data = new d3.data(datainitialised);
        data.initData();
    }
    
    // Daten würden eingelesen
    function datainitialised() {
        var timeline = new d3.timeline(yearSelected, data);
        timeline.initTimeline();
        map = new d3.map(data);
        map.initMap();
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(curyear) {
        map.ChoroplethColor(curyear);
    }

    that.init = init;
    return that;
};
