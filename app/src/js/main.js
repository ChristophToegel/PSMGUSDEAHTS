/* eslint-env browser  */

var d3 = d3 || {};
d3.main = function () {
    "use strict";

    var that = {},
        map, data,infobox;

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
        map = new d3.map(data,stateSelected);
        map.initMap();
        infobox = new d3.infobox(data);
        infobox.init();
        var menu = new d3.menu(filterSelected);
        menu.init();
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(year) {
        map.ChoroplethColor(year);
    }
    
    //staat wurde geclicked
    function stateSelected(states){
        infobox.changeData(states);
        
    }
    
    function filterSelected(filters){
        console.log(filters);
    }
    
    that.init = init;
    return that;
};
