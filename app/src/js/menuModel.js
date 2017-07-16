/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.menuModel = function () {
    "use strict";

    const illness = ["10", "11", "27", "35"],
        accidents = ["08", "16", "17", "20", "22", "23", "24", "25", "26", "29", "32", "33"],
        naturalCauses = ["04", "05", "06", "07", "09", "12", "14", "15", "21", "36"],
        others = ["28"],
        suspectknown = ["01", "02", "03", "18", "19", "30", "31", "34"],
        mainArray = [
            {
                name: "natural",
                id: 100,
                ids: naturalCauses
            },
            {
                name: "accidents",
                id: 101,
                ids: accidents
            },
            {
                name: "suspectknown",
                id: 102,
                ids: suspectknown
            },
            {
                name: "illness",
                id: 103,
                ids: illness
            },
            {
                name: "others",
                id: 104,
                ids: others
            }
        ];
    var that = {},
        catIdData, filters = [];

    //TODO no remove update instead!
    function initModel() {
        console.log("init Menu model");
        d3.csv("data/cat-id.csv", function (csv) {
            catIdData = csv;
            //main Callback menu ready
            //menuinitialised();
        });
    }

    function getStructure() {
        return mainArray;
    }

    //check ob filter ausgewählt wenn ja dann abwahlen wenn id mit oberkategorie ausgewählt wird dann alle untercategorien auswählen! 
    function selectUnselect(filterid) {
        let index = filters.indexOf(filterid);
        if (index == -1) {
            filters.push(filterid);
        } else {
            filters.splice(index, 1);
        }
    }

    function getSelectedFilters() {
        return filters;
    }

    //noch in MainArray aufteilen!
    function getSelectedNames() {
        var names = [];
        filters.forEach(function (d) {
            catIdData.forEach(function (e) {
                if (d == e.id) {
                    names.push(e.cause_short);
                }
            })
        })
        return names;
    }

    function selectNoFilter() {
        filters = [];
    }

    function selectAllFilter() {
        filters = [];
        for (var i = 0; i < catIdData.length; i++) {
            filters.push(catIdData[i].id);
        }
    }

    function selectOberkategorie(oberkategorieID) {
        let ids;
        mainArray.forEach(function (d) {
            if (d.id == oberkategorieID) {
                ids = d.ids;
            }
        })
        //check if all ids in oberkategorie--> alle abwählen
        var selected = true;
        ids.forEach(function (id) {
            if (filters.indexOf(id) == -1) {
                selected = false;
            }
        })
        if (selected) {
            //alle abwählen
            ids.forEach(function (id) {
                selectUnselect(id);

            })
        } else {
            //alle anwählen
            ids.forEach(function (id) {
                if (filters.indexOf(id) == -1) {
                    filters.push(id);
                }
            })
        }
    }
    
    //return id Selected Categorie +Oberkategorie
    function getSelectedCat() {
        var selectedOberkategorien = [];
        var selectedPartsOberkategorien = [];
        mainArray.forEach(function (oberkategorie) {
            let ids = oberkategorie.ids;
            var selected = true;
            var partsSelected=false;
            ids.forEach(function (id) {
                if (filters.indexOf(id) == -1) {
                    selected = false;
                }else{
                    partsSelected=true;
                }
            })
            if (selected) {
                selectedOberkategorien.push(oberkategorie.id);
            }
            if(partsSelected){
                selectedPartsOberkategorien.push(oberkategorie.id);
            }
        })
        return [selectedOberkategorien,selectedPartsOberkategorien];
    }

    initModel();
    that.getSelectedCat = getSelectedCat;
    that.selectUnselect = selectUnselect;
    that.getStructure = getStructure;
    that.selectNoFilter = selectNoFilter;
    that.selectAllFilter = selectAllFilter;
    that.selectOberkategorie = selectOberkategorie;
    that.getSelectedFilters = getSelectedFilters;
    that.getSelectedNames = getSelectedNames;
    that.initModel = initModel;
    return that;
};
