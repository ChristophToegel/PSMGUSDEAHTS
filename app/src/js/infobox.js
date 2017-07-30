/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.infobox = function () {
    "use strict";

    var that = {};

    //TODO no remove update instead!
    function initInfobox() {
        console.log("init Infobox");
        document.getElementById("nav-icon1").addEventListener("click", changeView);
        var deathInfoBox = d3.select("#textdata");
        deathInfoBox.append("div").attr("id", "menudata")
        deathInfoBox.append("div").attr("id", "deathinfodata")
            .classed("hidden", true);
    }

    //names hat oberkateogorie mit unterkategorien der ausgewählten menupunkte
    function updateSelection(names) {
        //ausgewählte menuelemente hier anzeigen
        var menudata = d3.select("#menudata");
        menudata.selectAll("*").remove();
        
        menudata.append("p")
            .text("Categories selected")
            .attr("class", "menudataHeading")


        menudata.append("div")
            .attr("id", "menudataEntries");


        let categorieEntry = d3.select("#menudataEntries")
            .selectAll("div")
            .data(names)
            .enter()
            .append("div");

        categorieEntry.append("p")
            .text(function (d) {
                return d.name + " deaths (" + d.selected.length + ")"
            })
            .attr("class", "mainCategorieEntry");
        
        let subCategoryEntries = categorieEntry.append("div")
            .attr("class","subCategoryContainer")
            .selectAll("p")
            .data(function(d){return d.selected})
            .enter()
            .append("p")
            .text(function(d){return d})


        
        /*categorieEntry.append("p")
            .text(function (d) {
                if (d.selected.length == 0) {
                    return "No subcategories selected"
                } else {
                    return d.selected
                }
            })
            .attr("class", "subCategorieEntry");
            */
        
        
        
        
        menudata.append("div")
            .attr("id", "disclaimer")
            .text("Death incidents are represented by the officers assigned police departement. The acutal place of the incident may vary. Some spots represent no longer existing police departments.")
    }

    function changeView() {
        console.log("change infobox");
        var menu = document.getElementById("menudata")
        var deathinfo = document.getElementById("deathinfodata")
        if (deathinfo.classList.contains("hidden")) {
            deathinfo.classList.remove("hidden");
            menu.classList.add("hidden");
        } else {
            deathinfo.classList.add("hidden");
            menu.classList.remove("hidden");
        }
    }

    function mapPointClicked(data) {
        var deathInfoBox = d3.select("#deathinfodata");
        deathInfoBox.selectAll("*").remove();
        deathInfoBox.append("p")
            .text(data.name)
            .attr("class", "deathInfoHeading")
        deathInfoBox
            .append("p").text(function () {
                if (data.value.length == 1) {
                    return "1 Death"
                } else {
                    return data.value.length + " Deaths"
                }
            }).attr("class", "deathNumber");
        deathInfoBox.append("div")
            .attr("id", "deathInfoEntries");

        let entry = d3.select("#deathInfoEntries").selectAll("div").data(data.value).enter().append("div").attr("class", "deathInfoEntry");
        entry.append("p")
            .text(function (d) {
                return d.person;
            })
            .attr("class", "deathEntryVictim");
        entry.append("p")
            .text(function (d) {
                return d.eow;
            })
            .attr("class", "deathEntryEOW");
        entry.append("p")
            .text(function (d) {
                return d.cause_short;
            })
            .attr("class", "deathEntryCause");
    }

    initInfobox();
    that.updateSelection = updateSelection;
    that.mapPointClicked = mapPointClicked;
    return that;
};