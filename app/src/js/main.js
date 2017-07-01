/* eslint-env browser  */

//var d3 = d3 || {};
var Index = Index || {};
//d3.main = function () {
Index = (function () {
    "use strict";

    var that = {},
        map, data, menu,timeline, deathInfo,
        year;//oder mit getYear immer aus timeline.js abfragen

    function init() {
        console.log("init main");
        //daten einlesen
        data = new Index.data(datainitialised);
        data.initData();
        
        menu = new Index.menu(filterSelected);
        map = new Index.map(mapisready,stateSelected);
        //TODO infobox bekommt aus daten übergeben und nicht data.
        //infobox = new Index.infobox(data);
        timeline = new Index.timeline(yearSelected);
        
    }
    
    // Daten würden eingelesen
    function datainitialised() {
        console.log("data ready");
        map.initMap(data.getMapDrawData(map.mapdatareceived));
        menu.init();
        
    }
    
    function mapisready(){
        //jetzt timeline aktivieren
        timeline.drawTimeGraph(data.getdataTimeline());
        //piechart alle staaten
        let boxdata=data.getInfoBoxData(year,undefined);
        menu.changeData(undefined,boxdata);
        
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(curyear) {
        year=curyear;
        //TODO Filter aus menu holen
        //updateMap(year, menu.getCheckedCats());
        updateMap(year);
    }
    
    //staat wurde geclicked
    function stateSelected(state){
        let boxdata=data.getInfoBoxData(year,state);
        menu.changeData(state,boxdata);
    }
    
    function filterSelected(filters){
        //console.log(filters);
        //var year=timeline.getYear(); alternative?!
        //updateMap(year,filters);
    }
    
    function updateMap(year, filters){
        var selectedData=data.getMapData(year,filters);
        map.ChoroplethColor(selectedData);
        data.getMapPointData(map.pointsready,year,filters);
    }
    
    init();
    that.init = init;
    return that;
}());
