/* eslint-env browser  */

//var d3 = d3 || {};
var Index = Index || {};
//d3.main = function () {
Index = (function () {
    "use strict";

    var that = {},
        map, data, menu, timeline, infobox,odometer,menuModel;

    function init() {
        console.log("init main");
        //daten einlesen
        data = new Index.data(datainitialised);
        data.initData();
        
        menuModel= new Index.menuModel();
        
        menu = new Index.menu(filterSelected,allFilterSelected,noFilterSelected,oberkategorieSelected);
        map = new Index.map(mapisready,stateSelected,pointsClicked);
        
        infobox = new Index.infobox();
        odometer = new Index.yearodometer();
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
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(year) {
        updateMenu(year,undefined);
        odometer.updateDateInfo(year);
        updateMap(year,menuModel.getSelectedFilters());
        
    }
    
    //draws the Menu with selected data
    function updateMenu(year,state){
        let structure = menuModel.getStructure();
        let boxdata=data.getMenuData(year,state,structure);
        menu.changeData(undefined,boxdata);
    }
    
    //staat wurde geclicked
    function stateSelected(state){
        let year=timeline.getYear();
        updateMenu(year,state);
        //menuInputChanged();
    }
    
    function filterSelected(filterid){
        menuModel.selectUnselect(filterid);
        let year=timeline.getYear();
        let filters= menuModel.getSelectedFilters();
        menuInputChanged();
        //updateMap(year,filters);
    }
    
    function menuInputChanged(){
        let filters= menuModel.getSelectedFilters();
        let oberkategorien= menuModel.getSelectedCat();
        //console.log(oberkategorien,filters);
        //TODO view Pattern
        menu.updateViewSelection(oberkategorien,filters);
        var names= menuModel.getSelectedNames();
        infobox.updateSelection(names);
        let year=timeline.getYear();
        updateMap(year,filters);
    }
    
    function updateMap(year, filters){
       // console.log(filters);
        var selectedData=data.getMapData(year,filters);
        map.ChoroplethColor(selectedData);
        data.getMapPointData(map.pointsready,year,filters);
    }
    
    //mapPointClicked--> infobox showdata
    function pointsClicked(data){
        infobox.mapPointClicked(data);
    }
    
    function allFilterSelected(){
        menuModel.selectAllFilter();
        menuInputChanged();
    }
    
    function noFilterSelected(){
        menuModel.selectNoFilter();
        menuInputChanged();
    }
    
    function oberkategorieSelected(oberkategorie){
        //console.log(oberkategorie);
        menuModel.selectOberkategorie(oberkategorie);
        menuInputChanged();
    }
    
    init();
    that.init = init;
    return that;
}());
