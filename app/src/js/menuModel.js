/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.menuModel = function () {
    "use strict";
    //28 others unused
    const illness = ["10", "11", "27", "35"],
        accidents = ["8", "16", "17", "20", "22", "23", "24", "25", "26", "29", "32", "33","13"],
        naturalCauses = ["4", "5", "6", "7", "9", "12", "14", "15", "21"],//, "36"
        suspectknown = ["1", "2", "3", "18", "19", "30", "31", "34"],
        mainArray = [
            {
                name: "Natural",
                id: 100,
                ids: naturalCauses
            },
            {
                name: "Accidents",
                id: 101,
                ids: accidents
            },
            {
                name: "Suspect known",
                id: 102,
                ids: suspectknown
            },
            {
                name: "Illness",
                id: 103,
                ids: illness
            },
        ];
    var that = {},
        catIdData, filters = [];

    function initModel() {
        console.log("init Menu model");
        d3.csv("data/cat-id.csv", function (csv) {
            catIdData = csv;
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
        var selected=[];
        mainArray.forEach(function (maincat){
            var subcats=maincat.array
            var sel=[];
            subcats.forEach(function (subcat){
                if (filters.indexOf(subcat.id)!=-1) {
                    sel.push(subcat.name);
                }
            })
            selected.push({name:maincat.name, selected:sel});
        })
        return selected;
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
                    //console.log(filters);
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
