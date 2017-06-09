/* eslint-env browser  */

//var d3 = d3 || {};
var Index = Index || {};
//d3.main = function () {
Index = (function () {
    "use strict";

    var that = {},
        map, data,infobox, menu,timeline,
        year;//oder mit getYear immer aus timeline.js abfragen

    function init() {
        console.log("init main");
        //daten einlesen
        data = new Index.data(datainitialised);
        data.initData();
        menu = new Index.menu(filterSelected);
        map = new Index.map(mapisready,stateSelected);
        //TODO infobox bekommt aus daten übergeben und nicht data.
        infobox = new Index.infobox(data);
        timeline = new Index.timeline(yearSelected);
    }
    
    // Daten würden eingelesen
    function datainitialised() {
        menu.init();
        console.log("data ready");
        map.initMap(data.getMapDrawData(map.mapdatareceived));
        infobox.init();
        
    }
    
    function mapisready(){
        //jetzt timeline aktivieren
        timeline.drawTimeGraph(data.getdataTimeline());
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(curyear) {
        year=curyear;
        updateMap(year, menu.getCheckedCats());
    }
    
    //staat wurde geclicked
    function stateSelected(state){
        //TODO hier daten holen!
        let boxdata=data.getInfoBoxData(year,state);
        infobox.changeData(state,boxdata);
    }
    
    function filterSelected(filters){
        //var year=timeline.getYear(); alternative?!
        updateMap(year,filters);
    }
    
    function updateMap(year, filters){
        var selectedData=data.getMapData(year,filters);
        map.ChoroplethColor(selectedData);
        //for coordinates performance?!
        data.getMapPointData(map.pointsready,year,filters);
    }
    init();
    that.init = init;
    return that;
}());
