/* eslint-env browser  */

//var d3 = d3 || {};
var Index = Index || {};
//d3.main = function () {
Index = (function () {
    "use strict";

    var that = {},
<<<<<<< HEAD
        map, data, menu,timeline, deathInfo, year;
        //oder mit getYear immer aus timeline.js abfragen
=======
        map, data, menu, timeline, infobox,odometer;
        //year;//oder mit getYear immer aus timeline.js abfragen
>>>>>>> origin/master

    function init() {
        console.log("init main");
        //daten einlesen
        data = new Index.data(datainitialised);
        data.initData();
        menu = new Index.menu(filterSelected);
        map = new Index.map(mapisready,stateSelected,pointsClicked);
        
        infobox = new Index.infobox();
        odometer = new Index.yearodometer();
        timeline = new Index.timeline(yearSelected);
        
    }
    
    // Daten würden eingelesen
    function datainitialised() {
        console.log("data ready");
        var filterdata=data.getFilterRawData();
        map.initMap(data.getMapDrawData(map.mapdatareceived));
        menu.init(filterdata);
    }
    
    function mapisready(){
        //jetzt timeline aktivieren
        timeline.drawTimeGraph(data.getdataTimeline());
<<<<<<< HEAD
        //piechart alle staaten
        let boxdata = data.getInfoBoxData(year,undefined);
        menu.changeData(undefined,boxdata);
        
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(curyear) {
        year = curyear;
=======
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(year) {
        let boxdata=data.getInfoBoxData(year,undefined);
        menu.changeData(undefined,boxdata);
        odometer.updateDateInfo(year);
>>>>>>> origin/master
        updateMap(year,menu.getSelectedFilters());
    }
    
    //staat wurde geclicked
    function stateSelected(state){
<<<<<<< HEAD
        let boxdata = data.getInfoBoxData(year,state);
=======
        let year=timeline.getYear();
        let boxdata=data.getInfoBoxData(year,state);
>>>>>>> origin/master
        menu.changeData(state,boxdata);
    }
    
    function filterSelected(filters){
        var names= menu.getSelectedNames();
        infobox.updateSelection(names);
        let year=timeline.getYear();
        updateMap(year,filters);
    }
    
    function updateMap(year, filters){
<<<<<<< HEAD
        var selectedData = data.getMapData(year,filters);
        map.ChoroplethColor(selectedData); data.getMapPointData(map.pointsready,year,filters);
=======
       // console.log(filters);
        var selectedData=data.getMapData(year,filters);
        map.ChoroplethColor(selectedData);
        data.getMapPointData(map.pointsready,year,filters);
    }
    
    //mapPointClicked--> infobox showdata
    function pointsClicked(data){
        infobox.mapPointClicked(data);
>>>>>>> origin/master
    }
    
    init();
    that.init = init;
    return that;
}());
