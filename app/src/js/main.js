/* eslint-env browser  */

var d3 = d3 || {};
d3.main = function () {
    "use strict";

    var that = {},
        map, data,infobox, menu,timeline,
        year;//oder mit getYear immer aus timeline.js abfragen

    function init() {
        console.log("init main");
        //daten einlesen
        data = new d3.data(datainitialised);
        data.initData();
    }
    
    // Daten würden eingelesen
    function datainitialised() {
        timeline = new d3.timeline(yearSelected, data);
        timeline.initTimeline();
        map = new d3.map(data,stateSelected);
        map.initMap();
        infobox = new d3.infobox(data);
        infobox.init();
        menu = new d3.menu(filterSelected);
        menu.init();
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(curyear) {
        year=curyear;
        console.log("year will map updaten");
        updateMap(year, menu.getCheckedCats());
    }
    
    //staat wurde geclicked
    function stateSelected(states){
        infobox.changeData(states);
    }
    
    function filterSelected(filters){
        //var year=timeline.getYear(); alternative?!
        console.log("filter will map updaten");
        updateMap(year,filters);
        //console.log(filters);
    }
    
    function updateMap(year, filters){
        console.log("aktuell ausgewählt: "+year+" "+filters);
        var selectedData=data.getMapData(year,filters);
        console.log(selectedData);
        map.ChoroplethColor(selectedData);
    }
    
    that.init = init;
    return that;
};
