/* eslint-env browser  */


var Index = Index || {};

Index = (function () {
    "use strict";

    var that = {},
        map, data, menu, timeline, infobox,odometer,menuModel;

    function init() {
        data = new Index.data(datainitialised);
        data.initData();
        menuModel= new Index.menuModel();
        menu = new Index.menu(filterSelected,allFilterSelected,noFilterSelected,oberkategorieSelected,subcategorychanged);
        map = new Index.map(mapisready,stateSelected,pointsClicked,stateHover);
        infobox = new Index.infobox();
        odometer = new Index.yearodometer();
        timeline = new Index.timeline(yearSelected);
    }
    
    //called by data if csv ready
    function datainitialised() {
        map.initMap(data.getMapDrawData(map.mapdatareceived));
        menu.init();
    }
    
    function mapisready(){
        timeline.drawTimeGraph(data.getdataTimeline());
    }
    
    //year wurde von timeline ausgewählt
    function yearSelected(year) {
        updateMenu(year,undefined);
        menu.hideSecondArc();
        odometer.updateOdometerDate(year);
        updateMap(year,menuModel.getSelectedFilters());
    }
    
    //draws the Menu with selected data
    function updateMenu(year,state){
        let structure = menuModel.getStructure();
        let catId= menuModel.getCatId();
        let boxdata=data.getMenuData(year,state,structure,catId);
        menu.changeData(state,boxdata);
        updateMenuView();
    }
    
    //staat wurde geclicked
    function stateSelected(state){
        let year=timeline.getYear();
        menu.hideSecondArc();
        updateMenu(year,state);
    }
    
    function stateHover(statename){
        menu.createTextLeftCorner(statename);
    }
    
    function filterSelected(filterid){
        menuModel.selectUnselect(filterid);
        menuInputChanged();
    }
    
    function menuInputChanged(){
        let filters= menuModel.getSelectedFilters();
        var names= menuModel.getSelectedNames();
        infobox.updateSelection(names);
        let year=timeline.getYear();
        updateMap(year,filters);
    }
    
    function updateMap(year, filters){
        var selectedData=data.getMapData(year,filters);
        odometer.updateCounter(selectedData[1]);
        map.ChoroplethColor(selectedData[0]);
        data.getMapPointData(map.pointsready,year,filters);
        updateMenuView();
    }
    
    function updateMenuView(){
        let filters= menuModel.getSelectedFilters();
        let oberkategorien= menuModel.getSelectedCat(); 
        menu.updateViewSelection(oberkategorien[0],filters,oberkategorien[1]);
    }
    
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
        menuModel.selectOberkategorie(oberkategorie);
        menuInputChanged();
    }
    
    function subcategorychanged(d){
        var cat = menuModel.getSelectedFilters();
        menu.updateViewOuterArc(cat);
    }
    
    init();
    that.init = init;
    return that;
}());
