/* eslint-env browser  */
/* global d3  */

var Index = Index || {};
Index.infobox = function () {
    "use strict";

    var that = {};

    //TODO no remove update instead!
    function initInfobox() {
        console.log("init Infobox");
    }
    
    function updateSelection(names){
        //ausgewählte menuelemente hier anzeigen
        var deathInfoBox = d3.select("#deathInfoBox");
        deathInfoBox.selectAll("*").remove();
        deathInfoBox.selectAll("p").data(names).enter()
            .append("p").text(function (d) {
                return d;
            })
        
    }
    
    function mapPointClicked(data){
        var deathInfoBox = d3.select("#deathInfoBox");
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
            }).attr("class","deathNumber");
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
    
    that.updateSelection=updateSelection;
    that.mapPointClicked=mapPointClicked;
    return that;
};